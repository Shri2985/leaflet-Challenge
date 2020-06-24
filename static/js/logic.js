var queryUrl ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
 });


//function to assign colours based on the colour
function getValue(x) {
	return x <= 1 ? "lightgreen" :
	       x <= 2 ? "green" :
	       x <= 3 ? "yellow" :
	       x <= 4 ? "orange" :
		       "red";
}

/// defining sytle for the circle object
function style(feature) {
	return {
	fillColor: getValue(feature.properties.mag),
	stroke: false,
	radius: 10,
    weight: 1,
    opacity: 0.5,
    fillOpacity: 1
	};
}


//bind popup for earthquake data
 
function createFeatures(earthquakeData) {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

 
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData,  {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, style(feature));
    }
});

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-streets-v9",
    accessToken: API_KEY
  });

  var greymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  

  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "outdoors-v11",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellitemap,
    "Grey": greymap,
    "Outdoors": outdoors
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
      center: [34.0522, -118.2437],
      zoom: 4,
      layers: [satellitemap, earthquakes]
  });

  // functions to style the seismic risk layer

// Set up the legend
   var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0,1,2,3,4]
    var colors = ['lightgreen','green','yellow','orange','red']
    var labels = [];
	var labeltext = ["0-1","1-2","2-3","3-4","4+"]
     // Add min & max
    var legendInfo = "<h1>Earthquake Magnitude</h1>" 
      "<div  class=\"labels\" style=\"background-color:white;\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
      "</div>";

     div.innerHTML = legendInfo;

      limits.forEach(function(limit, index) {
      labels.push("<input type=\"label" + "\" style=\"background-color:  "  + colors[index]  + ";width:20px;" + "\"> </input> &nbsp;" + labeltext[index] + " </br>");
    });

       div.innerHTML +=  "<div style=\"background-color:white;width:60px;\">" + labels.join("") + "</div>";
    return div;
    };

  // Adding legend to the map
  legend.addTo(myMap);

  // the seismic risks layer, styled using functions above
//L.geoJson(baseMaps, {style:getStyle}).addTo(map);

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
    //style:getStyle
  }).addTo(myMap);
  
};


