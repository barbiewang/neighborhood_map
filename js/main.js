/*
这是这个使用knockOut的view Model
 */
"use strict";
var touristPlaces = ["世界之窗","欢乐谷","海岸城","深圳湾公园","羊台山公园","莲花山公园"];

var MapViewModel = function (){
    this.detailsEnabled = ko.observable(false);
    this.places = ko.observableArray(touristPlaces);
    this.text = ko.observable();
    this.placeInEnglish = ko.observableArray([ 'Window of the World', 'OCT Bay','Coastal City','Shenzhen Bay Park',"Mount Yangtai","Lianhuashan Park"]);
};

MapViewModel.prototype.enableDetails = function(){
    this.detailsEnabled(true);
};
MapViewModel.prototype.disableDetails = function(){
    this.detailsEnabled(false);
};
MapViewModel.prototype.showMenu = function(){
    $(".menuUl").display = "block";
};
// MapViewModel.prototype.nytimeData = function(){
//      for(var i = 0;i<this.placeInEnglish;i++){
//          var place = this.placeInEnglish[i];
//          var nytimeUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + place + '&sort=newest&api-key=ef6858b2678449d99891114791de52ba';
//          $.getJson(nytimeUrl,function(data){
//              var article = data.response.docs[0];
//                  $("#nytime").append('<a href="'+article.web_url+'">'+article.headline.main+'</a>'+
//                      '<p>' + article.snippet + '</p>')
//
//          }).fail(function(){
//              $("#nytime").text('New York Times Articles Could Not Be Loaded');
//          })
//      }
// };
// MapViewModel.prototype.toggleNytime = function(){
//     var nytime = $("#nytime");
//     if(nytime.display !== null){
//         nytime.display = "block"
//     }else{
//         nytime.display = "none";
//     }
// };

ko.applyBindings(new MapViewModel());

//先定义地图会使用到的变量
var map;
var markers = [];
var locations = [
    {title: 'Window of the World', location: {lat: 22.5347167, lng: 113.9734179}},
    {title: 'OCT Bay', location: {lat: 22.5402908,lng: 113.9818588}},
    {title: 'Coastal City', location: {lat: 22.516975,lng: 113.934716}},
    {title: 'Shenzhen Bay Park', location: {lat: 22.5224158, lng: 114.0003285}},
    {title: "Mount Yangtai", location: {lat: 22.6682145, lng: 113.9857292}},
    {title: "Lianhuashan Park", location: {lat: 22.555043, lng: 114.058332}}
];
//加载地图的函数
var initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 22.53683, lng: 114.0413013},
        zoom: 12,
        mapTypeControl: false
    });
    //列出所有marker的地址
    //创建infoWindow
    var largeInfoWindow = new google.maps.InfoWindow();
    //创建标记所在的边界
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < locations.length; i++) {
        // 从地址数组中获取每一个地址的位置和名字
        var position = locations[i].location;
        var title = locations[i].title;
        // 创建每一个标记（marker），并将其放入之前定义的markers数组中
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            map: map,
            animation: google.maps.Animation.DROP,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        bounds.extend(marker.position);
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfoWindow);
            wikiLink(this);
            toggleBounce(this);
        });
    }
    var input = document.getElementById('autocomplete');
    var searchBox = new google.maps.places.SearchBox(input);
    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
       // markers = [];
        for(var i = 0; i<markers.length;i++){
            var marker = markers[i];
            if(input.value !== marker.title){
                alert("该地址不在查询范围内");
                markers.forEach(function (marker) {
                    marker.setMap(null);
                });
              //  markers = [];
            }else{
                markers.forEach(function (marker) {
                    marker.setMap(null);
                });
                marker.setMap(map);
                toggleBounce(marker);
            }

            //toggleBounce(marker);


            // markers.push(new google.maps.Marker({
            //     map: map,
            //     //icon: icon,
            //     title: place.name,
            //     position: place.geometry.location
            // }));
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        }

        });
        // For each place, get the icon, name and location.
       /*
        places.forEach(function (place) {
            for(var i = 0; i<touristPlaces.length;i++){
                var touristPlace = touristPlaces[i];
                if (place !== touristPlace ) {
                    console.log("该地址不在查询范围内");
                    markers.forEach(function (marker) {
                        marker.setMap(null);
                    });
                    markers = [];
                }
            }

            // var icon = {
            //     url: place.icon,
            //     size: new google.maps.Size(71, 71),
            //     origin: new google.maps.Point(0, 0),
            //     anchor: new google.maps.Point(17, 34),
            //     scaledSize: new google.maps.Size(25, 25)
            // };
            markers.push(new google.maps.Marker({
                map: map,
               //icon: icon,
                title: place.name,
                position: place.geometry.location
            }));
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        */
        map.fitBounds(bounds);
    };

    // autocomplete = new google.maps.places.Autocomplete(
    //     (document.getElementById('autocomplete')), {
    //         types: touristPlaces,
    //         componentRestrictions: {country:  "CN"}
    //     });
    // places = new google.maps.places.PlacesService(map);

var populateInfoWindow = function(marker,infoWindow){
    if(infoWindow.marker !== marker){
        infoWindow.marker = marker;
        infoWindow.setContent("<div id = 'wiki-header' style='color:black;'>"+marker.title+"</div>");
        infoWindow.open(map,marker);
        infoWindow.addListener('closeclick',function(){
             infoWindow.setMarker(null);
        })
    }
};
var toggleBounce = function (marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
};
var wikiLink = function(marker){
    var addr = marker.title;
    var wikiHeader = $("#wiki-header");
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +addr+ '&format=json&callback=wikiCallback';
    var wikiRequestTimeOut = setTimeout(function(){
        wikiHeader.append('<div> failed to get wikipedia sources</div>');
        toggleBounce(marker);
    },8000);
    $.ajax(wikiUrl, {
        dataType: 'jsonp',
        success: function (response) {
            var article = response[1][0];
            var url = response[3][0];
            wikiHeader.append('<div>' + '<a href = "'+url + '">'+article+ '</a>' + '维基百科'+'</div>');
            setTimeout(function(){
                toggleBounce(marker);
            },1500);
            clearTimeout(wikiRequestTimeOut)
        }
    })
};

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
/*
var geolocate = function(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var cicle = new google.maps.Circle({
                center:geolocation,
                radius:position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
        })
    }
};
*/
function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
        });
    }
}



