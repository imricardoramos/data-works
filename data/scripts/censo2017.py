#!/usr/bin/env python
# coding: utf-8

import sys
import pandas as pd
import geopandas as gpd
from sqlalchemy import create_engine
pd.set_option('expand_frame_repr', False)
pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)

SOURCE_FOLDER = "../sources"
OUTPUT_FOLDER = "../outputs"
df_etiquetas_distrito = pd.read_csv(f"{SOURCE_FOLDER}/microdato_censo2017-distritos.csv", sep=";")
df_etiquetas_distrito.columns = df_etiquetas_distrito.columns.str.lower()
df_etiquetas_p08 = pd.read_csv(f"{SOURCE_FOLDER}/etiquetas_persona_p08.csv", sep=";")
df_etiquetas_p10 = pd.read_csv(f"{SOURCE_FOLDER}/etiquetas_persona_p10.csv", sep=";")


# Mi computador no tiene mucha ram, así que lo metí en una base de datos
# personas = pd.read_csv("../../csv-identificación-geográfica-censo-2017/microdato_censo2017-distritos.csv", sep=";")
engine = create_engine('postgresql://postgres:postgres@localhost/censo_2017')
with engine.connect() as connection:
    query = f"""
        SELECT region, provincia, comuna, dc, p08, p09, p10
        FROM personas
        WHERE region = 13 AND p10 = 1
        """
    df_personas = pd.read_sql_query(query, connection)

df = df_personas.rename(columns={"p09": "edad"})

df = pd.merge(df, df_etiquetas_p08, left_on="p08", right_on="valor")\
       .rename(columns={"glosa": "sexo"}).drop(columns=["p08", "valor"])
df = pd.merge(df, df_etiquetas_p10, left_on="p10", right_on="valor")\
       .rename(columns={"glosa": "residencia_habitual"}).drop(columns=["p10", "valor"])
df = pd.merge(df, df_etiquetas_distrito, left_on=['comuna', 'dc'], right_on=['comuna', 'dc'])

#print(df)

bins= [18] + list(range(20,86,5))
labels = [f"{bins[i]}-{bins[i+1]-1}" for i in range(len(bins)-1)]
df["grupo_edad"] = pd.cut(df['edad'], bins=bins, labels=labels, right=False)
df = df[df["grupo_edad"].notna()]
df["grupo_edad"] = df["grupo_edad"].astype("str")

agg = df.groupby(["region", "provincia", "comuna", "dc", "sexo", "grupo_edad"], group_keys=False).count()

# Convertir filas a columnas en agregado
unstacked = agg.unstack(level=-2).unstack(level=-1).convert_dtypes()
unstacked.columns = [x[1].lower() + "_" + x[2].lower() for x in unstacked.columns.to_flat_index()]

output = unstacked.reset_index()
labelled = pd.merge(output, df_etiquetas_distrito, left_on=['comuna', 'dc'], right_on=['comuna', 'dc'])
output.insert(4, "nom_distrito", labelled["nom_distrito"])

#print(output)

output_path = f"{OUTPUT_FOLDER}/ratio-hombres-mujeres-santiago.csv"
output.to_csv(output_path, index=False)
print(f"Output at {output_path}")
