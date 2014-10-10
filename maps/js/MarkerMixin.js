App.MarkerMixin = Ember.Object.extend({
	map: null,
	markerOptions: {
	    animation: google.maps.Animation.DROP
	},

	showMarkers: function(markers) {
		var i;

		for (i = 0; i < markers.length; i++) {
			markers[i].setMap(this.get('map'));
		}
	},

	removeMarkers: function(markers) {
		var i;

		for (i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
	},

	newMarker: function(markerOptions, infoWindowContext) {
		markerOptions = $.extend(true,
				markerOptions,
				this.get('markerOptions'));

		var marker = new google.maps.Marker(markerOptions);

		return marker;
	}
});