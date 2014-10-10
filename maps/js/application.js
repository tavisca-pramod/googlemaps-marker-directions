window.App = Ember.Application.create({
	// LOG_TRANSITIONS: true,
	// LOG_TRANSITIONS_INTERNAL: true
});


App.FilterView = Ember.View.extend({
    templateName: 'filter',
    filters: null,
    data: null,
	infoWindow: null,
    map: null,
    isVisible: false,

	actions: {
		toggleButtonClicked: function() {
			this.$('.sidebar').toggleClass('hide');
		}
	},

    beforeGettingPlaces: Em.K,
    afterGettingPlaces: Em.K,

    // beforeGettingPlaces: function() {
    //     this.$('.square').toggleClass('hide');
    // },

    // afterGettingPlaces: function() {
    //     this.$('.square').toggleClass('hide');
    // },

	init: function() {
	    this._super();
        
        this.set('data', []);
        this.set('filters', []);

        App.initDefaultFilters(this);

	    this.set('infoWindow', new google.maps.InfoWindow());
	},

	filterToggled: function () {
	    var filters = this.get('filters');

	    for (var i = 0; i < filters.length; i++) {
	        this.changeMarkersDisplay(filters[i]);
	    }
	}.observes('filters.@each.isChecked'),

	changeMarkersDisplay: function (filter) {
	    var placesRequest = this.get('placesRequest'),
	    	infoWindow = this.get('infoWindow'),
	    	map = this.get('map');

	    if (filter.isChecked) {
	        if (filter.data.markers.length > 0) {
	            if (!filter.rendered) {
	                filter.rendered = true;
	                filter.data.showMarkers(map);
	            }
	        }
	        else {
	            placesRequest.types = filter.types.split('|');

                this.beforeGettingPlaces();

	            this.get('placesService')
                    .nearbySearch(placesRequest, function processPlaces (results, status) {
                    	var i,
                    		place;

                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            for(i = 0; i < results.length; i++) {
                            	place = results[i];
                            	filter.data.addNewMarker(place, map, infoWindow);
                            }
                            filter.rendered = true;
                        }
                        this.afterGettingPlaces();
                    }.bind(this));
	        }
	    } else if (filter.data.markers.length > 0 && filter.rendered) {
	        filter.rendered = false;
	        filter.data.removeMarkers();
	    }
	},

	placesService: function () {
	    return new google.maps.places.PlacesService(this.get('map'));
	}.property('map'),

	placesRequest: function () {
	    return {
	        location: this.get('map').getCenter(),
	        radius: 10000,
	        types: null
	    }
	}.property('map'),

	setUpMapControl: function () {
	    if (this.get('map')) {
	        setTimeout(function () {
                this.get('map').controls[google.maps.ControlPosition.TOP_LEFT].push(this.get('element'));
                this.set('isVisible', true) 
            }.bind(this), 1000);
        }
	}.observes('map')
});

App.GmapView = Em.View.extend({
    zoom: 8,
    lat: -34.397,
    lng: 150.644,
    map: null,
    autoInitialize: true,
    classNames: ['maps'],

    

    initializeMap: function (mapOptions) {
        var initOptions = /*this.getOptions();*/{ zoom: this.get('zoom'), center: new google.maps.LatLng(this.get('lat'), this.get('lng')), panControl: false, zoomControl: false, scaleControl: false }
        var mapOptions = $.extend({}, initOptions, mapOptions);

        this.set('map', new google.maps.Map(this.get('element'), mapOptions));
    },

    setUpMap: function () {
        if (this.get('autoInitialize')) {
            this.initializeMap();
        }
    }.on('didInsertElement')
});

App.MapView = Ember.View.extend({
    templateName: 'map'
});

App.HomeButtonView = Ember.View.extend({
    tagName: 'button',
    templateName: 'homeButton',
    map: null,
    lat: null,
    lng: null,
    zoom: null,

    initHomeButton: function () {
        if (this.get('map')) {
            this.get('map').controls[google.maps.ControlPosition.RIGHT_TOP].push(this.get('element'));
        }
    }.observes('map'),

    setMapCenter: function() {
    	var map = this.get('map'),
    		lat = this.get('lat'),
    		lng = this.get('lng'),
    		zoom = this.get('zoom');

        if (map && lat && lng) {
            map.panTo({ lat: lat, lng: lng });
            map.setZoom(zoom)
        }
    }.observes('map', 'lat', 'lng'),

    click: function () {
        this.setMapCenter();
    }
});