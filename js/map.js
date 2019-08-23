const observer = lozad();
observer.observe();
$("#header a").on('click', function(e){ e.preventDefault(); })
//map.fitBounds(e.layer.getBounds());
let panel = $(".contentPanel");
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
itlaEuLayer.on('click',itlaEuPanel)

let itlaItaPoint = [44.077765,8.1036493];
let itlaItaIco = L.icon({iconUrl: './img/marker_itlaIta.png', iconSize: [50, 50], iconAnchor: [0, 100] });
let itlaItaLayer = L.marker(itlaItaPoint,{icon:itlaItaIco});
itlaItaLayer.on('click',itlaItaPanel);

let osservatorioPoint = [46.073053,11.122166];
let osservatorioIco = L.icon({iconUrl: './img/marker_osservatorio.png', iconSize: [50, 50], iconAnchor: [0, 0] });
let osservatorioLayer = L.marker(osservatorioPoint,{icon:osservatorioIco});
osservatorioLayer.on('click',osservatorioPanel);

let adottaPoint = [45.859896, 11.658192];
let adottaIco = L.icon({iconUrl: './img/marker_adotta.png', iconSize: [50, 50], iconAnchor: [0, 0] });
let adottaLayer = L.marker(adottaPoint,{icon:adottaIco});
adottaLayer.on('click',adottaPanel)

let albertoPoint = [46.1532659,11.8047659];
let albertoIco = L.icon({iconUrl: './img/marker_ac.png', iconSize: [50, 50], iconAnchor: [0, 0] });
let albertoLayer = L.marker(albertoPoint,{icon:albertoIco});
albertoLayer.on('click',albertoPanel)

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
sloveniaEvent.on('click', sloveniaPanel)

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

$("#itlaEuLink").on('click', itlaEuPanel)
$("#itlaItaLink").on('click', itlaItaPanel)
$("#osservatorioLink").on('click', osservatorioPanel)
$("#albertoLink").on('click', albertoPanel)
$("#adottaLink").on('click', adottaPanel)
$("#eventList>a").on('click', sloveniaPanel);

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
}
function closePanel(){
  $("#mainPanel").removeClass('mainPanelOpened').addClass('mainPanelClosed');
  panel.html('');
  worldLayer.setStyle(worldStyle);
  continentsLayer.setStyle(contStyle);
  italyLayer.setStyle(italyStyle);
}

function sloveniaPanel(){
  map.setView(sloveniaPoint,18)
  div = "<div class='lozad mb-3' data-background-image='./img/sloveniaEventBanner.jpg'></div>";
  div += "<h5 class='py-2'>EUROPEAN TERRACED LANDSCAPES DAY <br><small>August 23rd–24th, 2019, Vrtovin, Vipava Valley, Slovenia</small></h5>";
  div += "<p class='font-weight-bold'>SUPPORTED BY:</p>";
  div += "<p class='mb-2'>The Municipality of Ajdovščina</p>";
  div += "<p class='font-weight-bold'>HELD BY:</p>";
  div += "<ul>"+
        "<li>The Aqua Turris Association</li>"+
        "<li>ITLA Slovenia</li>"+
        "<li>Faculty of Architecture, University of Ljubljana</li>"+
        "</ul>";
  div += "<p class='mt-2'>On 23 and 24 of July we will celebrate the European Terraced Landscapes Day in Vrtovin.<br>On August 25 the available members of the ITLA Committee will meet in Goriska Brda to deliberate urgent issues of ITLA including the selection of the next venue for the ITLA World Encounter (also on the themes and process) and future publications on terraced landscapes (ITLA Journal, Vegueta, Pirineos, etc.). We will send preparatory information to all members mid August.</p>"
  $('.contentPanel').html(div)
  observer.observe();
  openPanel()
}

function itlaEuPanel(){
  map.setView(itlaEuPoint,4)
  div = "<div class='lozad mb-3' data-background-image='./img/itlaEuActorBanner.jpg'></div>"
  div += "<h5 class='py-2'>WORLD ALLIANCE FOR TERRACED LANDSCAPES</h5>"
  div += "<blockquote class='text-secondary font-italic' style='font-size:18px;font-weight:bold;'>&#34;What will be the future of terraces rests upon<br>"+
        "our understanding and awareness of what we will do now.<br>"+
        "We wish, through our joint efforts, that the terraces<br>"+
        "will last forever, benefiting future generations.&#34;<br>"+
        "<span class='text-dark text-right' style='font-size:12px;'>Honghe Declaration, 15th November 2010</span></blockquote>";

  div += "<p class='mb-2'>The 1st International Conference on Terraced Landscapes was held in the People's Republic of China in November 2010. The government of Yuanyang prefecture - in the mountainous region of Ailao, where for centuries ancient multi-ethnic terraces were managed through a wise use of water - has convened, funded and held the first meeting in Mengzi (Yunnan), attended by more than 90 international experts from 16 countries, and more than 150 specialists from China. The conference took place under the aegis of UNESCO, FAO, the Ramsar Convention and several Chinese institutions and ministries. Five parallel working groups and a farmers forum were set up and coordinated by a dedicated team and facilitators from Honghe University. Topics covered concerned the history and culture of terraces, the impact of tourism on terraced landscapes, organic production, the management of UNESCO World Heritage Sites, policies and regulations on terraced landscapes and the crops associated with them. At the end of the conference the Honghe Declaration was approved, as a Manifesto for the terraced landscapes of the world. At the end, the majority of the participants of the Conference spontaneously gathered to create and sign the independent movement called <strong>World Alliance for Terraced Landscapes (ITLA)</strong>. To date, more than 200 professionals and activists from more than 20 countries around the world are members of ITLA.</p>";
  div += "<div class='my-3'><a href='http://terracedlandscapes2019.es/en/' title='home page project' target='_blank'>http://terracedlandscapes2019.es/en/</a></div>"
  div += "<img src='./img/itlaEuActorTagCloud.jpg' alt='Logo' class='img-fluid'>"
  div += "<div class='lozad mb-3' data-background-image='./img/itlaEuActorFooter.jpg'></div>"
  $('.contentPanel').html(div)
  observer.observe();
  openPanel()
}

function itlaItaPanel(){
  map.setView(itlaItaPoint,7)
  div = "<div class='lozad mb-3' data-background-image='./img/itlaItaActorBanner1.jpg'></div>";
  div += "<img src='./img/itlaItaActorBanner2.jpg' alt='Logo progetto' class='img-fluid'>";
  div += "<h5 class='py-2'>ALLEANZA MONDIALE PER I PAESAGGI TERRAZZATI (Italia)</h5>";
  div += "<p class='mb-2'>La Sezione Italiana dell'Alleanza Mondiale per i Paesaggi Terrazzati è stata fondata ad Arnasco (Savona) nel novembre 2011, a seguito della Prima Conferenza Mondiale tenutasi in Cina. I cinque membri fondatori sono la Cooperativa Olivicola di Arnasco (SV), il Comune di Arnasco, il Consorzio della Quarantina (GE), la Regione del Veneto e il Dipartimento di Geografia dell'Università di Padova.</p>";
  div += "<p class='mb-2'>L'Associazione conta un numero crescente di aderenti che rappresentano – attraverso il loro status di cittadini, agricoltori, artigiani, istituzioni pubbliche e private, associazioni e ricercatori – una vera e propria ricchezza che favorisce un approccio multidisciplinare all'analisi e alla valorizzazione dei paesaggi terrazzati.</p>";
  div +="<p class='mb-2'>La sezione Italiana dell'Alleanza si impegna nell'attuazione della Dichiarazione di Honghe e agisce per mantenere vivo l'interesse nei confronti dei paesaggi terrazzati, Si ripropone inoltre di essere punto di riferimento nazionale per la raccolta del materiale esistente relativo ai paesaggi terrazzati (scritti, immagini, saperi tradizionali), promuove l'inventario dei paesaggi terrazzati nazionali, l'organizzazione di workshop tematici con agricoltori, attivisti e ricercatori, sostiene e diffonde le buone pratiche presenti attivate dalle comunità locali dei paesaggi terrazzati italiani e mondiali.</p>";
  div += "<a href='http://www.paesaggiterrazzati.it/' title='Home page progetto' target='_blank' class='my-4'>http://www.paesaggiterrazzati.it/</a>";
  div += "<div class='lozad mt-3' data-background-image='./img/itlaItaActorFooter.jpg'></div>";
  $('.contentPanel').html(div)
  observer.observe();
  openPanel()
}

function adottaPanel(){
  map.setView(adottaPoint,18);
  div = "<div class='lozad mb-3' data-background-image='./img/adottaActorBanner.jpg'></div>";
  div += "<h5 class='py-2'>ADOTTA UN TERRAZZAMENTO</h5>";
  div += "<img src='./img/adottaActorLogoFull.jpg' alt='Logo progetto' class='img-fluid d-inline m-2 float-left align-top' width='150'>";
  div += "<p class='mb-2 d-inline align-top'>Il progetto <strong>Adotta un terrazzamento</strong> è nato su iniziativa del Comune di Valstagna (VI), del Club Alpino Italiano e del Dipartimento di Geografia dell'Università di Padova, che hanno stimolato insieme la costituzione dell'Associazione <strong>Adotta un terrazzamento in Canale di Brenta</strong> (prima 'Comitato Adotta un terrazzamento'). L'associazione si fa tramite tra i proprietari dei terrazzamenti, oggi emigrati all'estero o impossibilitati a prendersene cura, e gli amanti della montagna disponibili a supportarne la manutenzione. L'iniziativa è nata nel 2010 dopo le prime esperienze locali di 'adozione' spontanea di terrazzamenti: l'obiettivo è di regolare e allargare quest'attività, permettendo a chiunque di adottare un terrazzamento e sostenere la montagna del Canale di Brenta.</p>"
  div += "<p class='mb-2'>L'iniziativa è un potenziale 'genitore  adottivo' in visita da Cittadella per scegliere il suo terrazzamentoa naturale prosecuzione dell'attività di studio e animazione territoriale avviata dalle amministrazioni della valle (Comuni di Valstagna, Solagna, Campolongo, S.Nazario e Cismon del Grappa) e dalla Comunità Montana del Brenta in collaborazione con l'Università di Padova, l'Università IUAV di Venezia e la Regione del Veneto nell'ambito del progetto europeo <strong>ALPTER, paesaggi terrazzati dell'arco alpino</strong> (2005, vedi il sito <a href='www.alpter.net' target='_blank' title='home page progetto'>www.alpter.net</a>).</p>"
  div += "<p class='mb-2'>Dalla fine del 2018 <strong>Adotta un terrazzamento in Canale di Brenta</strong> è diventata una Associazione di Promozione Sociale (APS) riconosciuta nel Registro Regionale delle Associazioni, là dove prima era un 'Comitato' non registrato. Questo riconoscimento sancisce il ruolo stabile che svolge nella Valbrenta per il sostegno al recupero e al riutilizzo dei terrazzamenti in abbandono. L'associazione intende ampliare le sue attività per il futuro, attraverso corsi e progetti via via più ampi, quali corsi di formazione e progetti di recupero di contrade rurali storiche.</p>"
  div += "<div class='my-3'><a href='http://www.adottaunterrazzamento.org' title='Home page progetto' target='_blank'>http://www.adottaunterrazzamento.org</a></div>"
  div += "<div class='lozad mb-3' data-background-image='./img/adottaActorFooter.jpg'></div>";
  $('.contentPanel').html(div)
  observer.observe();
  openPanel()
}
function albertoPanel(){
  map.setView(albertoPoint,18)
  div ="<div class='my-3'><a href='http://www.cooptesto.it' title='home page' target='_blank'>http://www.cooptesto.it</a></div>";
  div += "<div class='my-3'><a href='mailto:alb.cosner@gmail.com?subject=Richiesta informazioni'>alb.cosner@gmail.com</a></div>";
  $('.contentPanel').html(div)
  observer.observe();
  openPanel()
}
function osservatorioPanel(){
  map.setView(osservatorioPoint,18)
  div = "<div class='lozad mb-3' data-background-image='./img/opActorBanner.png'></div>";
  div += "<h5 class='py-2'>OSSERVATORIO DEL PAESAGGIO TRENTINO</h5>";
  div += "<p class='mb-2'>L'Osservatorio del paesaggio trentino è uno degli Strumenti per il governo del territorio, previsti dall’ordinamento della Provincia autonoma di Trento.</p>";
  div += "L'Osservatorio è stato istituito nel 2010 in attuazione della Convenzione europea del paesaggio.</p>";
  div += "<p class='mb-2'>Finalità dell'Osservatorio sono la documentazione, lo studio, l'analisi, il monitoraggio del paesaggio trentino e la promozione della qualità delle trasformazioni che lo investono.</p>";
  div += "<p class='mb-2'>L'Osservatorio è costituito da un Forum rappresentativo delle diverse componenti della società trentina e da una Segreteria tecnico-scientifica. Il supporto organizzativo all'attività dell'Osservatorio è assicurato dalla Scuola per il governo del territorio e del paesaggio. </p>";
  div += "<a href='http://www.paesaggiotrentino.it/' title='Home page progetto' target='_blank' class='my-4'>http://www.paesaggiotrentino.it/</a>";
  div += "<div class='lozad mt-3' data-background-image='./img/opActorFooter.jpg'></div>";
  $('.contentPanel').html(div)
  observer.observe();
  openPanel()
}
