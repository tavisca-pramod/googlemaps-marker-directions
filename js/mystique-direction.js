  /**
   * Google Directions Application
   * @type {type}
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
   * DirectionsView View for Google Directions
   * @type {Ember.View}
   */
  App.DirectionsView = Ember.View.extend(
  {
    templateName: 'map-direction',
    
    name: 'Google Map Directions',

  /**
   * map Map to be used for initialize directions api
   * @type {google.maps.Map}
   */
    map: null,

  /**
   * startLocation Start Location for calculating route
   * @type {object}
   */
    startLocation: null,

  /**
   * endLocation End Location for calculating route 
   * @type {object}
   */
    endLocation: null, 

  /**
   * directionResponse contain the response status and data from direction service
   * @type {object}
   */
    directionResponse: {
      result: null,
      status: null
    },

    /**
    * travelMode Mode of travel to be set when fetching 
    * route from directions service. 
    * Possible values are : 
    *                     google.maps.TravelMode.DRIVING (Default), 
    *                     google.maps.TravelMode.BICYCLING,
    *                     google.maps.TravelMode.TRANSIT,
    *                     google.maps.TravelMode.WALKING
    */
    travelMode: google.maps.TravelMode.DRIVING,

    googleTravelMode: function()
    {
      return google.maps.TravelMode[this.get('travelMode').toUpperCase()];
    }.property('travelMode'),

    /**
     * mapObservable sets map of direction service instance 
     * when map property is changed
     */
    mapObservable: function() {
      this.get('directionsDisplay').setMap(this.get('map'));
    }.observes('map'),

    /**
     * travelModeObservable calculates route when travel mode is changed 
     */
    travelModeObservable: function() {
      this.calcDirection();
    }.observes('travelMode'),
    
    onStartLocationSelect: Ember.K,

    onEndLocationSelect: Ember.K,

    /**
     * initDirection initializes directions service
     */
    initDirection: function() { 

      /**
      * stepMarkers Array of markers to be maintained when 
      * an route is fetched from directions response
      * @type {Array}
      */
      this.set('stepMarkers',[]);
      
      /**
      * directionsService Google maps Directions Service API
      * @type {google.maps.DirectionsService}
      */
      this.set('directionService',  new google.maps.DirectionsService());

      /**
      * directionsDisplay Google maps DirectionsRenderer
      * @type {google.maps.DirectionsRenderer}
      */
      this.set('directionsDisplay', new google.maps.DirectionsRenderer());
  
      var mapOptions = {
        zoom:7,
        center: new google.maps.LatLng(41.850033, -87.6500523)
      };   
      /**
      * map map that needs to be set view map view
      * @type {google}
      */
      this.set('map', new google.maps.Map($('#map-canvas')[0], mapOptions));

      this.get('directionsDisplay').setMap(this.get('map'));
      this.get('directionsDisplay').setPanel($('#panel')[0]);
      /**
       * startInput Start location input element on DOM
       * @type {type}
       */
      var startInput = $('#start-location-input')[0];

      /**
       * endInput Start location input element on DOM
       * @type {type}
       */
      var endInput = $('#end-location-input')[0];

      this.get('map').controls[google.maps.ControlPosition.TOP_LEFT].push(startInput);
      this.get('map').controls[google.maps.ControlPosition.TOP_LEFT].push(endInput);
      
      var startAutoComplete = new google.maps.places.Autocomplete(startInput);
      var endAutoComplete = new google.maps.places.Autocomplete(endInput);
      
      startAutoComplete.bindTo('bounds', this.get('map'));
      endAutoComplete.bindTo('bounds',this.get('map'));
        
      directionView = this;
      
      /**
       * listener to act upon place selection
       */
      google.maps.event.addListener(startAutoComplete, 'place_changed',function(){

        var place = startAutoComplete.getPlace();
        if (!place.geometry) {
          return;
        }
        
        directionView.set('startLocation', place.geometry.location);
        directionView.onStartLocationSelect();
        directionView.calcDirection();
      });

      google.maps.event.addListener(endAutoComplete, 'place_changed',function(){

        var place = endAutoComplete.getPlace();
          if (!place.geometry) {
          return;
          }
      
        directionView.set('endLocation', place.geometry.location);
        directionView.onEndLocationSelect();
        directionView.calcDirection();
      });
   
    }.on('didInsertElement'),
    
    /** 
     * calcDirection  calculates routes based on Start location,
     * End location, sets up markers on successful response
     */
    calcDirection : function() { 
      
      /**
       * stepMarkerInfoWindow infowindow for the direction markers
       * @type {google}
       */
      var stepMarkerInfoWindow = new google.maps.InfoWindow();

      /**
       * setMarkerContent sets marker content on the marker and 
       * attaches an event for infowindow
       * @param {type} marker marker instance to set content on
       * @param {type} text   content to be set on passed marker instance
       */
      function setMarkerContent(marker, text) {
          google.maps.event.addListener(marker, 'click', function() {
          
          stepMarkerInfoWindow.setContent(text);
          
          stepMarkerInfoWindow.open(directionView.get('map'), marker);
        });
      };

      /**
       * markLocations create and puts markers in stepMarkers array
       * @param  directionResult result fromt he directions service
       */
      function  markLocations(directionResult) {
           
          /**
           * selectedRoute  For each step, placing a marker and adding the data to the marker's
           * info window. Pushing the marker to an array to keep track of it.
           * @type {object}
           */
          var selectedRoute = directionResult.routes[0].legs[0];

          for (var i = 0; i < selectedRoute.steps.length; i++) {
      
            var marker = new google.maps.Marker({
              position: selectedRoute.steps[i].start_location,
              map: directionView.get('map')
            });

            setMarkerContent(marker, selectedRoute.steps[i].instructions);
          
            
            directionView.get('stepMarkers')[i] = marker;
        }
      };

      /**
       * if both Start and End locations are set then only perform route calculation
       */
      if(this.get('startLocation') && this.get('endLocation'))
      {    
        // First, remove any existing markers from the map and clear the array.
        for (var i = 0; i < this.get('stepMarkers').length; i++) {
         this.get('stepMarkers')[i].setMap(null);
        }

        this.set('stepMarkers',[]);
        
        /**
         * request create an request instance to be sent to directions service
         * @type {Object}
         */
        var request = {
          origin:this.get('startLocation'),
          destination: this.get('endLocation'),
          travelMode: this.get('googleTravelMode')
        };  

        /**
         * fetches the route based on the request instance passed.
         * On success we set the markers
         */
        this.get('directionService').route(request, function(response, status) {
          if (status == google.maps.DirectionsStatus.OK) {
             
             directionView.get('directionsDisplay').setDirections(response);
             markLocations(response);
              
             directionView.get('directionResponse').status = status;
             directionView.get('directionResponse').result = response;
          }
        });
      }
    },
    //end of calcDirection  
  });



