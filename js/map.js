let map = L.map('map');
let world = './inc/continents.json';
let continents = './inc/world.geo.json';
let worldStyle = { stroke: false, fill: true, fillColor: '#fff', fillOpacity: 1}
let highlight = { stroke: false, fill: true, fillColor: 'yellow', fillOpacity: 1}
let selected, worldLayer, continentsLayer;
let thunderF = L.tileLayer('https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=f1151206891e4ca7b1f6eda1e0852b2e');
let zoom = 0;
$.getJSON(world,function(data){
  worldLayer = L.geoJson(data, { clickable: true, style: worldStyle})
  .on('click', function (e) {
    if (selected) { e.target.resetStyle(selected) }
    selected = e.layer
    selected.bringToFront()
    selected.setStyle(highlight)
    //map.fitBounds(e.layer.getBounds());
    openPanel(e)
    L.DomEvent.stopPropagation(e);
  })
  .addTo(map);
  // map.fitBounds(worldLayer.getBounds());
})
$.getJSON(continents,function(data){
  continentsLayer = L.geoJson(data, { clickable: true, style: worldStyle})
  .on('click', function (e) {
    if (selected) { e.target.resetStyle(selected) }
    selected = e.layer
    selected.bringToFront()
    selected.setStyle(highlight)
    //map.fitBounds(e.layer.getBounds());
    openPanel(e)
    L.DomEvent.stopPropagation(e);
  }).addTo(map);
})

map.on('click',closePanel)

map.on('zoomend',function(){
  zoom = map.getZoom();
  if (zoom >= 5 && zoom <= 10) {
    map.addLayer(continentsLayer)
  }else {
    map.removeLayer(continentsLayer)
  }
  console.log(map.getZoom());
})

$("#closeMainPanel").on('click',closePanel);

function openPanel(layer){
  $("#mainPanel").removeClass('mainPanelClosed').addClass('mainPanelOpened');
  $("#continentName").text(layer.sourceTarget.feature.properties.name);
}
function closePanel(){
  $("#mainPanel").removeClass('mainPanelOpened').addClass('mainPanelClosed');
  worldLayer.setStyle(worldStyle);
}
