/*
这是这个使用knockOut的view Model
 */
"use strict";
var touristPlaces = ["世界之窗","欢乐谷","海岸城","深圳湾公园","羊台山公园","莲花山公园"];
var MapViewModel = function (){
    this.detailsEnabled = ko.observable(false);
    this.places = ko.observableArray(touristPlaces);
    this.text = ko.observable();
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
var map,places,autocomplete;
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
           // icon: markerIcon,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        bounds.extend(marker.position);
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfoWindow);
            wikiData(this);
            //toggleBounce(this);
        });
       // google.maps.event.addListener(marker, 'click', toggleBounce(marker));
    }
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
    if(marker.getAnimation() != null){
        marker.setAnimation(null);
    }
    else{
        marker.setAnimation(google.maps.Animation.Bounce)
    }
};
var wikiData = function(marker){
    var addr = marker.title;
    var wikiHeader = $("#wiki-header");
    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +addr+ '&format=json&callback=wikiCallback';
    var wikiRequestTimeOut = setTimeout(function(){
        $wikiElem.text("failed to get wikipedia sources");
    },8000);
    $.ajax(wikiUrl, {
        dataType: 'jsonp',
        success: function (response) {
            var article = response[1][0];
            var url = response[3][0];
            wikiHeader.append('<div>' + '<a href = "'+url + '">'+article+ '</a></div>');
            clearTimeout(wikiRequestTimeOut)
        }
    })
};
