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

let itlaEuPoint = [55.70,28.40];
let itlaEuIco = L.icon({iconUrl: './img/marker_itlaEu.png', iconSize: [50, 50], iconAnchor: [0, 0] });
let itlaEuLayer = L.marker(itlaEuPoint,{icon:itlaEuIco});

let itlaItaPoint = [44.077765,8.1036493];
let itlaItaIco = L.icon({iconUrl: './img/marker_itlaIta.png', iconSize: [50, 50], iconAnchor: [0, 100] });
let itlaItaLayer = L.marker(itlaItaPoint,{icon:itlaItaIco});

let osservatorioPoint = [46.073053,11.122166];
let osservatorioIco = L.icon({iconUrl: './img/marker_osservatorio.png', iconSize: [50, 50], iconAnchor: [0, 0] });
let osservatorioLayer = L.marker(osservatorioPoint,{icon:osservatorioIco});

let adottaPoint = [45.859896, 11.658192];
let adottaIco = L.icon({iconUrl: './img/marker_adotta.png', iconSize: [50, 50], iconAnchor: [0, 0] });
let adottaLayer = L.marker(adottaPoint,{icon:adottaIco});

let albertoPoint = [46.1532659,11.8047659];
let albertoIco = L.icon({iconUrl: './img/marker_ac.png', iconSize: [50, 50], iconAnchor: [0, 0] });
let albertoLayer = L.marker(albertoPoint,{icon:albertoIco});

let eventIco = L.AwesomeMarkers.icon({
  prefix: 'fa',
  extraClasses: 'far',
  icon: 'calendar-alt',
  markerColor: 'red'
 });
let sloveniaPoint = [45.8944465,13.8158263];
let sloveniaEvent = L.marker(sloveniaPoint, {icon: eventIco});
sloveniaEvent.properties = {};
sloveniaEvent.properties.div = 'sloveniaEvent';
console.log(sloveniaEvent);

let actorsRegion = L.layerGroup([osservatorioLayer, adottaLayer, albertoLayer]);
let actorsNation = L.layerGroup([itlaItaLayer]);
let actorsContinent = L.layerGroup([itlaEuLayer]).addTo(map);
let eventGroup = L.layerGroup([sloveniaEvent]).addTo(map);

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
  continentsLayer = L.geoJson(data, {
    clickable: true, style: contStyle,
    onEachFeature: onEachFeatureIso
  })
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
      remove = [italyLayer,continentsLayer,thunderF,trentinoLyr,actorsRegion,actorsNation]
      add = [worldLayer,actorsContinent]
      removeLayer(remove)
      addLayer(add)
    break;
    case (zoom >=5 && zoom <=7):
      remove = [worldLayer, italyLayer, thunderF,trentinoLyr,actorsContinent, actorsRegion]
      add = [continentsLayer,actorsNation]
      removeLayer(remove)
      addLayer(add)
    break;
    case (zoom >= 8 && zoom <=10):
      remove = [worldLayer, continentsLayer,actorsNation, actorsContinent, trentinoLyr]
      add = [thunderF,italyLayer,actorsRegion]
      removeLayer(remove)
      addLayer(add)
    break;
    case (zoom > 10):
      remove = [worldLayer,continentsLayer,italyLayer,actorsContinent, actorsNation]
      add = [thunderF,trentinoLyr,actorsRegion]
      removeLayer(remove)
      addLayer(add)
    break;
  }
})

$("#closeMainPanel").on('click',closePanel);

featureByIso = {}
$("#landList>a").on('click',function() {
  iso = $(this).data('iso');
  map.fitBounds(featureByIso[iso].getBounds() );
});
$("#actorList>a, #eventList>a").on('click', function(){
  lat = $(this).data('lat');
  lon = $(this).data('lon');
  zoom = $(this).data('zoom');
  console.log(zoom);
  setView([lat,lon],zoom)
})

function removeLayer(list){ $.each(list,function(i,layer){ map.removeLayer(layer) }) }
function addLayer(list){ $.each(list,function(i,layer){ map.addLayer(layer) }) }

function setView(ll,zoom){
  map.setView(ll,zoom);
}

function onEachFeatureIso(feature, layer) {
  // layer.on({
  //   mouseover: highlightFeature,
  //   mouseout: resetHighlight,
  //   click: zoomToFeature
  // });
  featureByIso[feature.properties.iso_a2] = layer;
}
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
