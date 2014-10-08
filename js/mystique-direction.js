/**
 * [Google Directions Application]
 * @type {[type]}
 */
window.App = Ember.Application.create();

App.ApplicationRoute = Ember.Route.extend({
  setupController: function(controller) {
    controller.set('title', "Directions service!");
  }
});

App.ApplicationController = Ember.Controller.extend({
  appName: 'Google Map Directions'
});

/**
 * [locations List of locations data to used in input for start/end select ]
 * @type {Array}
 */
App.locations = [
    {
       name: 'chicago, il',
       displayName: 'Chicago'
    },

    {
      name:'st louis, mo',
      displayName: 'St Louis'
    },

    {
      name:'joplin, mo',
      displayName: 'Joplin, MO'
    }];

/**
 * [DirectionsView View for Google Directions]
 * @type {[Ember.View]}
 */
App.DirectionsView = Ember.View.extend({
  templateName: 'map-direction',
  
  name: 'Google Map Directions',

/**
 * [map Map to be used for initialize directions api]
 * @type {[google.maps.Map]}
 */
  map: null,

/**
 * [startLocation Start Location for calculating route ]
 * @type {[object]}
 */
  startLocation: null,

/**
 * [endLocation End Location for calculating route ]
 * @type {[object]}
 */
  endLocation: null, 

/**
 * [stepDisplay infowindow to be set on markers click event]
 * @type {[google.maps.InfoWindow]}
 */
  stepDisplay: null,
  
  /**
   * [stepMarkers Array of markers to be maintained when 
   * an route is fetched from directions response]
   * @type {[Array]}
   */
  stepMarkers: null,

  /**
  * [travelMode Mode of travel to be set when fetching 
  * route from directions service. 
  * Possible values are : 
  *                     google.maps.TravelMode.DRIVING (Default), 
  *                     google.maps.TravelMode.BICYCLING,
  *                     google.maps.TravelMode.TRANSIT,
  *                     google.maps.TravelMode.WALKING
  */
  travelMode: google.maps.TravelMode.DRIVING,

  /**
  * [locations locations array to be used for start and end location options]
  * @type {[Array]}
  */
  locations: App.locations,

  /**
   * [directionsService Google maps Directions Service API]
   * @type {[google.maps.DirectionsService]}
   */
  directionsService: null,
  
  /**
   * [directionsDisplay Google maps DirectionsRenderer]
   * @type {[google.maps.DirectionsRenderer]}
   */
  directionsDisplay: null,

  /**
  * [directionResponse Response form the directions service ]
  * @type {[object]}
  */
  directionResponse: null,

/**
 * [startLocationObservable calculates routes when Start location is changed]
 */
  startLocationObservable: function() {
    this.calcDirection();
  }.observes('startLocation'),

  /**
   * [endLocationObservable calculates routes when End location is changed]
   */
  endLocationObservable: function() {
    this.calcDirection();
  }.observes('endLocation'),

  /**
   * [mapObservable sets map of direction service instance when map property is changed]
   */
  mapObservable: function() {
    directionsDisplay.setMap(map);
  }.observes('map'),

  /**
   * [travelModeObservable calculates route when travel mode is changed ]
   */
  travelModeObservable: function() {
    this.calcDirection();
  }.observes('travelMode'),

  directionResponseObservable: function() {
    // raise an event that response has come
  }.observes('directionResponse'),

  /**
   * [initDirection initializes directions service]
   * @return {[type]} [description]
   */
  initDirection: function() { 

  var mapOptions = {
      zoom:7,
      center: new google.maps.LatLng(41.850033, -87.6500523)
    };   
/**
 * [map map that needs to be set view map view]
 * @type {google}
 */
  map = new google.maps.Map($('#map-canvas')[0], mapOptions);

  /**
   * [startInput Start location input element on DOM]
   * @type {[type]}
   */
  var startInput = $('#start-location-input')[0];

  /**
   * [endInput Start location input element on DOM]
   * @type {[type]}
   */
  var endInput = $('#end-location-input')[0];

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(startInput);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(endInput);
  

  var startAutoComplete = new google.maps.places.Autocomplete(startInput);
  var endAutoComplete = new google.maps.places.Autocomplete(endInput);
  
  startAutoComplete.bindTo('bounds', map);
  endAutoComplete.bindTo('bounds', map);
    
  directionView = this;
  
  /**
   * [listener to act upon place selection]
   */
  google.maps.event.addListener(startAutoComplete, 'place_changed',function(){

    var place = startAutoComplete.getPlace();
    if (!place.geometry) {
      return;
    }
    
    directionView.set('startLocation', place.geometry.location);
  });

  google.maps.event.addListener(endAutoComplete, 'place_changed',function(){

    var place = endAutoComplete.getPlace();
      if (!place.geometry) {
      return;
      }
  
    directionView.set('endLocation', place.geometry.location);
  });

    /**
     * [stepMarkers reset the step markers]
     * @type {Array}
     */
    stepMarkers= [];

    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();    

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel($('#panel')[0]);

    /**
     * [stepDisplay infowindow for the direction markers]
     * @type {google}
     */
    stepDisplay = new google.maps.InfoWindow();
 
  }.on('didInsertElement'),
  
  /** 
   * [calcDirection  calculates routes based on Start location , End location, sets up markers on successful response]
   */
  calcDirection : function() { 
    
    /**
     * [setMarkerContent sets marker content on the marker and attaches an event for infowindow]
     * @param {[type]} marker [marker instance to set content on]
     * @param {[type]} text   [content to be set on passed marker instance]
     */
    function setMarkerContent(marker, text) {
        google.maps.event.addListener(marker, 'click', function() {
        
        stepDisplay.setContent(text);
        
        stepDisplay.open(map, marker);
      });
    };

    /**
     * [markLocations create and puts markers in stepMarkers array]
     * @param  directionResult [result fromt he directions service]
     */
    function  markLocations(directionResult) {
        // For each step, placing a marker and adding the data to the marker's
        // info window.
        // Pushing the marker to an array to keep track of it 
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

    /**
     * if both Start and End locations are set then only perform route calculation
     */
    if(this.get('startLocation') && this.get('endLocation'))
    {    
      // First, remove any existing markers from the map and clear the array.
      for (var i = 0; i < stepMarkers.length; i++) {
       stepMarkers[i].setMap(null);
      }

      stepMarkers = [];
      
      /**
       * [request create an request instance to be sent to directions service]
       * @type {Object}
       */
      var request = {
        origin:this.get('startLocation'),
        destination: this.get('endLocation'),
        travelMode: this.get('travelMode')
      };  

      /**
       * [fetches the route based on the request instance passed.
       * On success we set the markers]
       */
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
          markLocations(response);
          directionResponse= response;
        }
      });
    }
  },
  //end of calcDirection  
});



