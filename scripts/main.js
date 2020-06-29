// api key mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoicHJpbWVsbGUiLCJhIjoiY2s4azM0eWVlMDFsdjNmcmpwcGlzajk0ciJ9.XID90QJuHQwvuhmG7sViFg';

// Initiëren map
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/primelle/ckbo4ui422mk11jnziowm6678', //link naar de map op mapbox
  center:[-97.330620, 35.516241], 
  zoom: 3
});

// url van openweather
var openWeatherMapUrl = 'https://api.openweathermap.org/data/2.5/weather';

// api key van openweather
var openWeatherMapUrlApiKey = '6a719e3c4dfb752cbb9fe577d9c14591';

//alles binnen deze functie moet uitgevoerd worden zodra kaart geladen is
map.on('load', function () {

  // ga door 'var locations' in locations.js heen en geef me 'location' terug
  locations.forEach(function(location) {
    // Usually you do not want to call an api multiple times, but in this case we have to
    // because the openWeatherMap API does not allow multiple lat lon coords in one request.

    var request = openWeatherMapUrl + '?' + 'appid=' + openWeatherMapUrlApiKey + '&lon=' + location.coordinates[0] + '&lat=' + location.coordinates[1];
    // [0] of [1] staat voor eerste en tweede waarde in array

    // Haal het huidige weerbericht op aan de hand van de coordinaten van de locaties
    fetch(request)
    
    .then(function(response) {
      if(!response.ok) throw Error(response.statusText);
      return response.json();
    })

    .then(function(response) {
      // plot de weather response + icoon op de map (verwijst naar functie plotImageOnMap)
      plotImageOnMap(response.weather[0].icon, location)
    })

    .catch(function (error) {
      console.log('ERROR:', error);
    });

  });

});

function plotImageOnMap(icon, location) {
  // haal een eigen afbeelding voor de icon op van OpenWeather
  map.loadImage(

    'https://openweathermap.org/img/w/' + icon + '.png',
    
    function (error, image) {
      if (error) throw error;
     // unieke naam geven aan icon
      map.addImage("weatherIcon_" + location.name, image);
      // source toevoegen
      map.addSource("point_" + location.name, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: location.coordinates 
            }
          }]
        }
      });

      map.addLayer({
        id: "points_" + location.name,
        type: "symbol",
        source: "point_" + location.name,   // verwijst naar map.addSource
        layout: {
          "icon-image": "weatherIcon_" + location.name,
          "icon-size": 1.5
        }
      });
    }
  );
}

function popupTekstMelding(){

  map.on('load', function () {
  map.addSource('spacexLocations', {
    'type': 'geojson',
    'data': {
      'type': 'FeatureCollection',
      'features': popupTekst //pak beschrijving van var popukTekst in popup.js
    }
  });

  // Voeg een layer toe die de locaties toont de plaatsen 
  map.addLayer({
    'id': 'spacexLocations',
    'type': 'symbol',
    'source': 'spacexLocations',
    'layout': {
      'icon-image': '{icon}-15',
      'icon-allow-overlap': true
    }
  });

  // Maak een popup aan, maar voeg het nog niet toe aan  de map. 
  var popup = new mapboxgl.Popup({
    closeButton: false, // geen close button, popup werkt met hover
    closeOnClick: false // geen onclick, popup werkt met hover
  });

  map.on('mouseenter', 'spacexLocations', function (e) {    //als je op de kaart over een van de places gaat, dan kom je bij deze functie terecht 
    //'e' = dataattribuut van de locatie waar je overheen hovert)
    var coordinates = e.features[0].geometry.coordinates.slice();   //haalt coordinator op van locatie 
    var description = e.features[0].properties.description; // haalt beschrijving van bij behorende locatie op

    // zorgt ervoor dat de juiste coordinator en beschrijving wordt toegevoegd aan de map
    popup     
      .setLngLat(coordinates) // zet popup op deze coordinator
      .setHTML(description) // voeg beschrijving met html toe
      .addTo(map);  // voeg popup toe aan de kaart
  });

  // haal popup weg als je weggaat met je muis   
  map.on('mouseleave', 'spacexLocations', function () {
    popup.remove();
  });
});

}

// zoom in de rechterbenedenhoek
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-right')


popupTekstMelding();




