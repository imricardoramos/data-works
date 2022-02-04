import L from 'leaflet'
import Papa from 'papaparse'
import 'leaflet-providers'
const BACKEND_DOMAIN = "http://localhost:4000"

export default Map = {
  async init(){
    const santiago_coordinates = [-33.447487, -70.673676]
    var map = L.map('map').setView(santiago_coordinates, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const myStyle = feature => ({
        color: getColor(feature.properties.ratio),
        weight: 2,
        fill: true,
        opacity: 1.0,
        fillOpacity: 0.6,
        className: "polygon"
    });

    const [santiagoDCPolygons, data] = await Promise.all([getSantiagoDistricts(), getData()]);
    const dataWithIds = {}
    data.forEach(record => {
      id = `${record["comuna"]}-${record["dc"]}`
      dataWithIds[id] = record
    })
    santiagoDCPolygons.features = santiagoDCPolygons.features.map(feature => {
      id = `${feature.properties.COMUNA}-${feature.properties.COD_DISTRI}`
      feature.properties.nom_distrito = dataWithIds[id]["nom_distrito"]
      feature.properties.ratio = dataWithIds[id]["hombre_20-24"]/dataWithIds[id]["mujer_20-24"]
      return feature
    })
    L.geoJSON(santiagoDCPolygons, {
      style: myStyle,
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<div>${feature.properties.COD_DISTRI}</div><div>${feature.properties.COMUNA}</div><div>${feature.properties.nom_distrito}</div><div>${feature.properties.ratio}</div>`)
      }
    }).addTo(map);
  }
}

async function getSantiagoDistricts(){
  const request = await fetch(`${BACKEND_DOMAIN}/data/carto/santiago-dc`);
  const data = await request.json();
  return data
}

async function getData(){
  const request = await fetch(`${BACKEND_DOMAIN}/data/ratio-hombres-mujeres-santiago.csv`);
  const data = await request.text();
  const parsed = Papa.parse(data, {header: true, dynamicTyping: true})
  return parsed.data
}

function getColor(d) {
    if(d > 1) d = d-1
    else d = -(1/d - 1)

    cdict = ["#DE6565", "#EF9995", "#FACDC9", "#FFFFFF", "#C5D7ED", "#88B0DA", "#3B8CC7"]
    return d > 0.10 ? cdict[6] :
           d > 0.05 ? cdict[5] :
           d > 0.02 ? cdict[4] :
           d < -0.10 ? cdict[0] :
           d < -0.05 ? cdict[1] :
           d < -0.02 ? cdict[2] :
           cdict[3]
}
