//map.fitBounds(e.layer.getBounds());

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

let trentino = "./inc/trentino_terracement.geojson";
let trentinoStyle = {weight:1,fillOpacity:.3}

let selected, worldLayer, continentsLayer, italyLayer, trentinoLyr;
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

$.getJSON(trentino,function(data){
  trentinoLyr = L.geoJson(data,{style: trentinoStyle});
});


var resetMap = L.Control.extend({
  options: { position: 'topleft'},
  onAdd: function (map) {
    var container = L.DomUtil.create('div', 'extentControl leaflet-bar leaflet-control leaflet-touch');
    btn=$("<a/>",{href:'#'}).appendTo(container);
    $("<i/>",{class:'fas fa-home'}).appendTo(btn)
    btn.on('click', function (e) {
      e.preventDefault()
      map.fitBounds(worldLayer.getBounds());
    });
    return container;
  }
})
map.addControl(new resetMap());
L.control.scale({imperial:false}).addTo(map);

map.on('click',closePanel)
map.on('zoomstart',function(){$("#spinner").show()})
map.on('zoomend',function(){
  $("#spinner").hide()
  zoom = map.getZoom();
  switch (true) {
    case (zoom < 5):
      map.removeLayer(italyLayer)
      map.removeLayer(continentsLayer)
      map.removeLayer(thunderF)
      map.removeLayer(trentinoLyr)
      map.addLayer(worldLayer)
    break;
    case (zoom >=5 && zoom <=7):
      map.removeLayer(worldLayer)
      map.removeLayer(italyLayer)
      map.removeLayer(thunderF)
      map.removeLayer(trentinoLyr)
      map.addLayer(continentsLayer)
    break;
    case (zoom >= 8 && zoom <=10):
      map.removeLayer(worldLayer)
      map.removeLayer(continentsLayer)
      map.removeLayer(trentinoLyr)
      map.addLayer(thunderF)
      map.addLayer(italyLayer)
    break;
    case (zoom > 10):
      map.removeLayer(worldLayer)
      map.removeLayer(continentsLayer)
      map.removeLayer(italyLayer)
      map.addLayer(thunderF)
      map.addLayer(trentinoLyr)
    break;
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
