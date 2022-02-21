import L from 'leaflet'
import Papa from 'papaparse'
import 'leaflet-providers'
import '../vendor/rSlider'

const AGE_RANGES = [18, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85] 

export default SantiagoSexRatioPage = {
  async init(){
    const [santiagoDCPolygons, data] = await Promise.all([getSantiagoDistricts(), getData()]);
    const santiago_coordinates = [-33.447487, -70.633676]
    var map = L.map('map').setView(santiago_coordinates, 13);
    map.createPane('myPane');
    map.getPane('myPane').style.zIndex = 500;

    L.tileLayer('https://api.mapbox.com/styles/v1/imricardoramos/ckzwplmen000k14le5yej173a/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiaW1yaWNhcmRvcmFtb3MiLCJhIjoiY2p5a2s2ZmRrMGY4NjNtdDU2bDFhYXJndCJ9.geQX3QuFcu-yLzFLU1IsJA', {
        pane: 'myPane'
    }).addTo(map);

    const myStyle = feature => ({
        color: getColor(feature.properties.ratio),
        weight: 2,
        fill: true,
        opacity: 1.0,
        fillOpacity: 1,
        className: "polygon"
    });

    const polygonsLayer = L.geoJSON(null, {
      style: myStyle,
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(`
        <div>${feature.properties.nom_distrito}</div>
        <div>H: ${feature.properties.H}</div>
        <div>M: ${feature.properties.M}</div>
        <div>ratio: ${feature.properties.ratio}</div>`)
      }
    }).addTo(map);

    new rSlider({
       target: '#age-selector',
       values: AGE_RANGES,
       range: true,
       tooltip: false,
       scale: true,
       labels: true,
       set: [20, 25],
       onChange: values => {
         updateLayer(polygonsLayer, santiagoDCPolygons, data, values.split(",").map(bound => parseInt(bound)))
       }
    });
  }
}

async function getSantiagoDistricts(){
  const request = await fetch(`/data/carto/santiago-dc?external=true`);
  const data = await request.json();
  return data
}

async function getData(){
  const request = await fetch_presigned(`/data/outputs/ratio-hombres-mujeres-santiago.csv?external=true`);
  const data = await request.text();
  const parsed = Papa.parse(data, {header: true, dynamicTyping: true})
  return parsed.data
}

function getColor(d) {
    if(d > 1) d = d-1
    else d = -(1/d - 1)

    cdict = ["#DE6565", "#EF9995", "#FACDC9", "#FFFFFF", "#C5D7ED", "#88B0DA", "#3B8CC7"]
    return d > 0.15 ? cdict[6] :
           d > 0.07 ? cdict[5] :
           d > 0.03 ? cdict[4] :
           d < -0.15 ? cdict[0] :
           d < -0.07 ? cdict[1] :
           d < -0.03 ? cdict[2] :
           cdict[3]
}

function updateLayer(layer, santiagoDCPolygons, data, ageRange){
  [minAge, maxAge] = ageRange
  const dataWithIds = {}
  data.forEach(record => {
    id = `${record["comuna"]}-${record["dc"]}`
    dataWithIds[id] = record
  })

  const ageRanges = AGE_RANGES
                .slice(0, -1)
                .map((age, index) => [age, `${age}-${AGE_RANGES[index+1]-1}`])
                .filter(([age, _value]) => (age >= minAge && age < maxAge))
                .map(([age, value]) => value)

  santiagoDCPolygons.features = santiagoDCPolygons.features.map(feature => {
    id = `${feature.properties.COMUNA}-${feature.properties.COD_DISTRI}`
    feature.properties.nom_distrito = dataWithIds[id]["nom_distrito"]
    sum_h = ageRanges.reduce((previousValue, currentValue) => {
      return previousValue + dataWithIds[id][`hombre_${currentValue}`]
    }, 0)
    sum_m = ageRanges.reduce((previousValue, currentValue) => {
      return previousValue + dataWithIds[id][`mujer_${currentValue}`]
    }, 0)
    feature.properties.H = sum_h
    feature.properties.M = sum_m
    feature.properties.ratio = sum_h/sum_m
    return feature
  })

  layer.addData(santiagoDCPolygons)
}

async function fetch_presigned(url, opts={}){
  const response = await fetch(url)
  const presigned_url = await response.text()
  return fetch(presigned_url, opts)
}
