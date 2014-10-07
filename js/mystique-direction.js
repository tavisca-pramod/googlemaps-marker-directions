window.App = Ember.Application.create();

App.ApplicationRoute = Ember.Route.extend({
  setupController: function(controller) {
    controller.set('title', "Directions service!");
  }
});

App.ApplicationController = Ember.Controller.extend({
  appName: 'Google Map Directions'
});

App.DirectionsView = Ember.View.extend({
  templateName: 'map-direction',
  
  name: 'Google Map Directions',

  map: null,

  startLocation: null,

  endLocation: null, 

  stepDisplay: null,
  
  stepMarkers: null,

  locations: [
    {
       id:1,
       name: 'chicago, il',
       displayName: 'Chicago'
    },

    {
      id: 2,
      name:'st louis, mo',
      displayName: 'St Louis'
    },

    {
      id: 3,
      name:'joplin, mo',
      displayName: 'Joplin, MO'
    }],

  startLocationObservable: function() {
    this.calcDirection();
  }.observes('startLocation'),

  endLocationObservable: function() {
    this.calcDirection();
  }.observes('endLocation'),

  mapObservable: function() {
    directionsDisplay.setMap(map);
  }.observes('map'),

  directionsService: null,
  
  directionsDisplay: null,

  initDirection: function() { 
    stepMarkers= [];
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    
    var mapOptions = {
      zoom:7,
      center: new google.maps.LatLng(41.850033, -87.6500523)
    };

    map = new google.maps.Map($('#map-canvas')[0], mapOptions);

    directionsDisplay.setMap(map);

    stepDisplay = new google.maps.InfoWindow();
 
  }.on('didInsertElement'),
  
  calcDirection : function() { 
  
    function setMarkerContent(marker, text) {
       google.maps.event.addListener(marker, 'click', function() {
        // Open an info window when the marker is clicked on,
        // containing the text of the step location.
        stepDisplay.setContent(text);
        
        stepDisplay.open(map, marker);
      });
    };

    function  markLocations(directionResult) {
        // For each step, placing a marker and adding the data to the marker's
        // info window.
        // Attach the marker to an array to keep track of it 
        var selectedRoute = directionResult.routes[0].legs[0];

        for (var i = 0; i < selectedRoute.steps.length; i++) {
    
        var marker = new google.maps.Marker({
          position: selectedRoute.steps[i].start_location,
          map: map
        });

        setMarkerContent(marker, selectedRoute.steps[i].instructions);
        stepMarkers[i] = marker;
      }
    };


    if(this.get('startLocation') && this.get('endLocation'))
    {    
      // First, remove any existing markers from the map and clear the array.
      for (var i = 0; i < stepMarkers.length; i++) {
       stepMarkers[i].setMap(null);
      }

      stepMarkers = [];
      
      var request = {
        origin:this.get('startLocation').name,
        destination: this.get('endLocation').name,
        travelMode: google.maps.TravelMode.DRIVING
      };  

      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
          markLocations(response);
        }
      });
    }
  },
  //end of calcDirection
  
});



