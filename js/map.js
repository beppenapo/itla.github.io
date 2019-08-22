let map = L.map('map').setView([0,0],2);
let world = './inc/continents.json';
let worldStyle = { stroke: false, fill: true, fillColor: '#fff', fillOpacity: 1}
let highlight = { stroke: false, fill: true, fillColor: 'yellow', fillOpacity: 1}
let continents = './inc/world.geo.json';
let contStyle = { stroke: true, color:'rgba(0,0,0,.8)', weight:1, fill: true, fillColor: '#fff', fillOpacity: 1}
let contHighlight = { stroke: true, color:'rgba(210,143,12,1)', weight:1, fill: true, fillColor: 'yellow', fillOpacity: 1}
let italy = './inc/italy.json';
let italyStyle = { stroke: true, color:'rgba(0,0,0,.8)', weight:1, fill: true, fillColor: '#fff', fillOpacity: .3}
let italyHighlight = { stroke: true, color:'rgba(210,143,12,1)', weight:1, fill: true, fillColor: 'yellow', fillOpacity: .3}
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
    openPanel(e)
    L.DomEvent.stopPropagation(e);
  })
  .addTo(map);
  map.fitBounds(worldLayer.getBounds());
})
$.getJSON(continents,function(data){
  continentsLayer = L.geoJson(data, { clickable: true, style: contStyle})
  .on('click', function (e) {
    if (selected) { e.target.resetStyle(selected) }
    selected = e.layer
    selected.bringToFront()
    selected.setStyle(contHighlight)
    openPanel(e)
    L.DomEvent.stopPropagation(e);
  });
})
$.getJSON(italy,function(data){
  italyLayer = L.geoJson(data, { clickable: true, style: italyStyle})
  .on('click', function (e) {
    if (selected) { e.target.resetStyle(selected) }
    selected = e.layer
    selected.bringToFront()
    selected.setStyle(italyHighlight)
    openPanel(e)
    L.DomEvent.stopPropagation(e);
  });
})

map.on('click',closePanel)

map.on('zoomend',function(){
  zoom = map.getZoom();
  console.log(zoom);
  switch (true) {
    case (zoom < 5):
      map.removeLayer(italyLayer)
      map.removeLayer(continentsLayer)
      map.removeLayer(thunderF)
      map.addLayer(worldLayer)
    break;
    case (zoom >=5 && zoom <=7):
      map.removeLayer(worldLayer)
      map.removeLayer(italyLayer)
      map.removeLayer(thunderF)
      map.addLayer(continentsLayer)
    break;
    case (zoom > 7):
      map.removeLayer(worldLayer)
      map.removeLayer(continentsLayer)
      map.addLayer(thunderF)
      map.addLayer(italyLayer)
  }
})

$("#closeMainPanel").on('click',closePanel);

function openPanel(layer){
  $("#mainPanel").removeClass('mainPanelClosed').addClass('mainPanelOpened');
  $("#continentName").text(layer.sourceTarget.feature.properties.name);
}
function closePanel(){
  $("#mainPanel").removeClass('mainPanelOpened').addClass('mainPanelClosed');
  worldLayer.setStyle(worldStyle);
  continentsLayer.setStyle(contStyle);
  italyLayer.setStyle(italyStyle);
}
