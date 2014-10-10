App.MapData = function(filterId) {
    this.filterId = filterId;
    this.markers = [];
    this.windowContents = [];
}

App.MapData.prototype.showMarkers = function(map) {
    var i;

    for (i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(map);
    }
};

App.MapData.prototype.removeMarkers = function () {
    var i;

    for (i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(null);
    }
};


App.MapData.prototype.addNewMarker = function (place, map, infoWindow) {
    var markerOptions = $.extend(true, 
        App.MapData.markerOptions, 
        {
            position: place.geometry.location,
            map: map
    });

    var marker = new google.maps.Marker(markerOptions);

    var windowContent = App.MapData.infoWindowTemplate({
        name: place.name,
        icon: place.icon
    });

    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(windowContent);
        infoWindow.open(map, marker);
    });

    this.markers.push(marker);
    this.windowContents.push(windowContent);
};

App.MapData.markerOptions = {
    animation: google.maps.Animation.DROP
}

App.MapData.infoWindowTemplate = Handlebars.compile(
    "<h5>{{name}}</h5>" + 
    "<img src='{{icon}}'></img>"
);

App.Filter = (function() {
    var id = 0;

    return function () {
        this.id = id++;
        this.rendered = false;
        this.isChecked = false;
        this.data = null;
        this.types = '';
        this.name = '';
        this.displayName = '';
        this.markerIcon = '';
    }
})();

App.initFiltersAndData = function (filterDetails) {
    var filter = new App.Filter();
    var data = new App.MapData(filter.id);

    filter.data = data;
    filter.types = filterDetails.types;
    filter.name = filterDetails.name;
    filter.displayName = filterDetails.displayName;
    filter.markerIcon = filterDetails.markerIcon;

    this.data.push(data);
    this.filters.push(filter);
}

App.initDefaultFilters = function (context) {
    var initFiltersAndData = $.proxy(App.initFiltersAndData, context);
    initFiltersAndData({
        types: 'amusement_park|aquarium|art_gallery|campground|museum|park|stadium|zoo',
        name: 'Activity',
    });
    initFiltersAndData({
        types: 'airport',
        name: 'Airport',
    });
    initFiltersAndData({
        types: 'atm|bank',
        name: 'Bank',
    });
    initFiltersAndData({
        types: 'bowling_alley|casino|movie_rental|movie_theater',
        name: 'Entertainment',
    });
    initFiltersAndData({
        types: 'bakery|bar|cafe|food|meal_delivery|meal_takeaway|restaurant',
        name: 'Food',
    });
    initFiltersAndData({
        types: 'beauty_salon|dentist|doctor|gym|hospital|physiotherapist|spa',
        name: 'Health&Wellness',
    });
    initFiltersAndData({
        types: 'night_club',
        name: 'Nightlife',
    });
    initFiltersAndData({
        types: 'clothing_store|electronics_store|jewelry_store|shopping_mall',
        name: 'Shopping',
    });
    initFiltersAndData({
        types: 'bicycle_store|bus_station|car_rental|subway_station|taxi_stand|train_station',
        name: 'Transport',
    });    
}