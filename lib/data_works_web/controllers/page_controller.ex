defmodule DataWorksWeb.PageController do
  use DataWorksWeb, :controller
  alias DataWorks.Storage

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def outputs(conn, %{"series_name" => series_name}) do
    path = Path.join(["data", "outputs", series_name])
    contents = Storage.read!(path)
    text(conn, contents)
  end

  def carto(conn, %{"document_name" => "santiago-dc"}) do
    json(conn, santiago_dc())
  end

  def santiago_dc do
    filename = "xn--Censo_2017_Distrito_censal_Poblacin,_viviendas_por_rea_y_densidad-gmf02j.geojson"
    Path.join(["data", "sources", "carto", filename])
    |> Storage.read!()
    |> Jason.decode!()
    |> Map.update!("features", fn features ->
      features
      |> Enum.filter(fn feature -> feature["properties"]["REGION"] == "13" and feature["properties"]["PROVINCIA"] == "131" end)
      |> filter_big_districts()
    end)
  end

  defp filter_big_districts(features) do
    features
    |> Enum.filter(fn feature ->
      !(
        (feature["properties"]["COMUNA"] == "13115" and feature["properties"]["COD_DISTRI"] in [2, 3]) or
        (feature["properties"]["COMUNA"] == "13124" and feature["properties"]["COD_DISTRI"] in [7]) or
        (feature["properties"]["COMUNA"] == "13119" and feature["properties"]["COD_DISTRI"] in [13])
      )
    end)
  end
end
