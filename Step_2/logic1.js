

// Store API endpoints inside subject queryUrl


var InitialTime = new Date().toISOString().split('T')[0];
var date = new Date()
date.setDate(date.getDate() - 1);
var FinalTime = date.toISOString().split('T')[0];

 var EarthquakeQueryUrl = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" +  FinalTime + "&endtime=" + InitialTime;

  var TectonicPlatesQueryUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json" 

 


// Perform a GET request to the query URL
d3.json(EarthquakeQueryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

//Documentation on L.Circle can be found at https://leafletjs.com/reference-1.3.0.html#circle

function createFeatures(earthquakeData) {       

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJson(earthquakeData, {
      onEachFeature: function (feature, layer){
        layer.bindPopup("<h3>" + feature.properties.title +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
      },
      pointToLayer: function (feature, latlng) {
        return new L.circle(latlng,
          {radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            fillOpacity: .8,
            stroke: true,
            color: "black",
            weight: 1
        })
      }
    });
  
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes)
  }
  

  function getColor(m) {
    return m > 5 ? '#BF0077' :
    m > 4  ? '#CE0D00' :
    m > 3  ? '#D55700' :
    m > 2  ? '#C55B47' :
    m > 1   ? '#DDA700' :
              '#CDE500';
  }
  
  function getRadius(r){
    return r*20000
  }
  
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var outdoormap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoicGl0YXJ5cyIsImEiOiJjamljYjBmZTMwMWY2M3BucjNzeXI0cG05In0.GV-ALNLB9sg1XeIzr_iiIw");

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoicGl0YXJ5cyIsImEiOiJjamljYjBmZTMwMWY2M3BucjNzeXI0cG05In0.GV-ALNLB9sg1XeIzr_iiIw");

  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1IjoicGl0YXJ5cyIsImEiOiJjamljYjBmZTMwMWY2M3BucjNzeXI0cG05In0.GV-ALNLB9sg1XeIzr_iiIw");

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Outdoor Map": outdoormap,
    "Dark Map": darkmap,
    "Satellite Map": satellitemap
  };

  //New Layer Group for the tectonic plates
  var tPlates = new L.LayerGroup();

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "TectonicPlates": tPlates
  };

  // Create our map, giving it the outdoormap, earthquakes layers, and tectnonic plates to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 2,
    layers: [outdoormap, earthquakes, tPlates ]
  });

  //Use the JSON with tectnonic plate data and add the plate features to the map
  d3.json(TectonicPlatesQueryUrl, function (plateBoundryData) {
    L.geoJson(plateBoundryData, {
      color: "red",
       weight: 3
  })
  .addTo (tPlates);
});

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

 // Create legend
 var legend = L.control({position: 'bottomright'});

 legend.onAdd = function (myMap) {

   var div = L.DomUtil.create('div', 'info legend'),
             grades = [0, 1, 2, 3, 4, 5],
             labels = [];

 // loop through our density intervals and generate a label with a colored square for each interval
   for (var i = 0; i < grades.length; i++) {
       div.innerHTML +=
           '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
           grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
   }
   return div;
 };

 legend.addTo(myMap);  
}

