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

ko.applyBindings(new MapViewModel());

//先定义地图会使用到的变量
var map,autocomplete;
var markers = [];
var locations = [
    {title: '世界之窗', location: {lat: 22.5347167, lng: 113.9734179}},
    {title: '欢乐谷', location: {lat: 22.5402908,lng: 113.9818588}},
    {title: '海岸城', location: {lat: 22.516975,lng: 113.934716}},
    {title: '深圳湾公园', location: {lat: 22.5224158, lng: 114.0003285}},
    {title: "羊台山", location: {lat: 22.6682145, lng: 113.9857292}},
    {title: "莲花山公园", location: {lat: 22.555043, lng: 114.058332}}
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

        map.fitBounds(bounds);
    autocomplete = new google.maps.places.Autocomplete(
        (document.getElementById('autocomplete')), {
            types: ['geocode'],
            componentRestrictions: {country:  "CN"}
        });
    autocomplete.addListener('place_changed', fillInAddress);
    var gobutton = $("#go");
    gobutton.click(function() {
        var place = document.getElementById('autocomplete').value;
        handleAddress(place);
    });
};

var handleAddress = function (place) {
    if (place === undefined) {
        return;
    }
    var targetMarker = null;
    for(var i=0;i<markers.length;i++){
        markers[i].setMap(null);
        if (place == markers[i].title) {
            targetMarker = markers[i];
            targetMarker.setMap(map);
            toggleBounce(targetMarker);
            setTimeout(function() {
                toggleBounce(targetMarker);
            },1500);
        }

    }
};

var fillInAddress = function () {
    var place = autocomplete.getPlace();
    handleAddress(place.name);
};


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
    var wikiUrl = 'https://zh.wikipedia.org/w/api.php?action=opensearch&search=' +addr+ '&format=json&callback=wikiCallback';
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



