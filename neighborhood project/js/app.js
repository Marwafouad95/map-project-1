//Hard coded inital Locations
var myLocations = [
    {
        name: 'Istanbul',
        address: '214 S Highland Ave, Pittsburgh, PA',
        img: "img/1.jpg",
        lat: 41.008238,
        long: 28.978359
    },
    {
        name: 'Antalya',
        address: '5469 Penn Ave Pittsburgh, PA 15206',
        img: "img/2.jpg",
        lat: 36.896891,
        long: 30.713323
    },
    {
        name: 'Ankara',
        address: '236 Fifth Ave Pittsburgh, PA 15222',
        img: 'img/3.jpg',
        lat: 39.933363,
        long: 32.859742
    },
    {
        name: 'Trabzon',
        address: '5608 Walnut St Pittsburgh, PA 15232',
        img: "img/4.jpg",
        lat: 41.002697,
        long: 39.716763
    },
    {
        name: 'Bursa',
        address: '5841 Penn Ave Pittsburgh, PA 15206',
        img: "img/images.jpg",
        lat: 40.188528,
        long: 29.060964
    }

];



var map;
var ko;
var google;
var alert;
var clientID="MGNZSQQCETXG5MYA0NPCIQOIJ3L1JXRCPT04ATGXYCMEM2Y1";
var clientSecret="C1TRHKKRNTDJWGLF4WYTLMFJFOBYTUF2BYU5YBKVC2FHD44R";

// tells the view model what to do when a change occurs
// Declaring global variables now to satisfy strict mode
var Location = function (data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.long = data.long;
    this.url = "";
    this.address = data.address;
    this.img = data.img;
    this.visible = ko.observable(true);
	
	var cont='https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20161016' + '&query=' + this.name;
    $.getJSON(cont).done(function(data) {
		var results = data.response.venues[0];
		self.url= results.url;
		if (typeof self.url === 'undefined'){
			self.url = "";
		}
	}).fail(function() {
		alert("There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data.");
	});
    this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
	    '<div class="content"><a href="' + self.url +'">' + self.url+ "</a></div>" +
        '<div class="content"><img src="' + self.img + '">' + "</div>" +
        '<div class="content">' + self.address + "</div></div>";
    this.infoWindow = new google.maps.InfoWindow({ content: self.contentString });
	
    
    //Adds new markers at each location in the initialLocations Array
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.long),
        map: map,
        icon: 'img/marker.png',
        animation: google.maps.Animation.DROP,
        title: data.name
    });

    this.showMarker = ko.computed(function () {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    //Map info windows to each item in the markers array
    //Add click event to each marker to open info window
    this.marker.addListener('click', function () {
        self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
		'<div class="content"><a href="' + self.url +'">' + self.url + "</a></div>" +
            '<div class="content">' + self.address + "</div>" +
            '<div class="content"><img src="' + self.img + '">' + "</div>" +
        self.infoWindow.setContent(self.contentString);
        self.infoWindow.open(map, this); // Open info window on correct marker when list item is clicked
        self.marker.setAnimation(google.maps.Animation.BOUNCE); //Markers will bounce when clicked
        setTimeout(function () {
            self.marker.setAnimation(null);
        }, 1400); //Change value to null after 2 seconds and stop markers from bouncing
		
    });
	

    //Markers will bounce when clicked
    this.bounce = function (place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};
//ViewModel
function AppViewModel() {
    var self = this;

    this.searchTerm = ko.observable("");

    this.locationList = ko.observableArray([]);

    //Create Instance of a map from the Google maps api
    //Grab the reference to the "map" id to display map
    //Set the map options object properties
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: { lat: 38.963745, lng: 35.243322 },
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        }

    });


    //Copies the values of myLocations and stores them in LocationList(); observableArray
    myLocations.forEach(function (locationItem) {
        self.locationList.push(new Location(locationItem));
    });

    //Filter through observableArray and filter results using knockouts
    this.filteredList = ko.computed(function () {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function (locationItem) {
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function (locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

    this.mapElem = document.getElementById('map');
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}

//Error Handing
function errorHandling() {
    alert("Google Maps has failed to load.");
}
