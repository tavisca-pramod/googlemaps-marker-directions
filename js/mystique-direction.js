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
  
  name : 'Google Map Directions',

  map : null,

  startLocation :null,

  endLocation :null,  

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
  // directions map assignment
  }.observes('map'),

  directionsService: null,
  
  directionsDisplay: null,

  initDirection: function() { 
   
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    
    var mapOptions = {
      zoom:7,
      center: new google.maps.LatLng(41.850033, -87.6500523)
    };
    map = new google.maps.Map($('#map-canvas')[0], mapOptions);

    directionsDisplay.setMap(map);
 
  }.on('didInsertElement'),

  calcDirection : function() { 
  
    if(this.get('startLocation') && this.get('endLocation'))
    {
      var request = {
        origin:this.get('startLocation').name,
        destination: this.get('endLocation').name,
        travelMode: google.maps.TravelMode.DRIVING
      };  

      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
        }
      });
    }
  }
  //end of calcDirection
});



