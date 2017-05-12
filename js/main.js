/*
这是这个使用knockOut的view Model
 */
"use strict";
//预先定义数组及数组的值；
var touristPlaces = ["世界之窗","欢乐谷","海岸城","深圳湾公园","羊台山公园","莲花山公园"];
var gobutton = $('#go');

var MapViewModel = function (){
    this.detailsEnabled = ko.observable(false);
    this.places = ko.observableArray(touristPlaces);//默认显示所有地点
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
var map,autocomplete;
var markers = [];
var locations = [
    {title: '世界之窗', location: {lat: 22.5347167, lng: 113.9734179}},
    {title: '欢乐谷', location: {lat: 22.5402908,lng: 113.9818588}},
    {title: '海岸城', location: {lat: 22.516975,lng: 113.934716}},
    {title: '深圳湾公园', location: {lat: 22.5224158, lng: 114.0003285}},
    {title: "羊台山公园", location: {lat: 22.6512447, lng: 113.9710522}},
    {title: "莲花山公园", location: {lat: 22.555043, lng: 114.058332}}
];
//加载地图的函数
var initMap = function() {
    //呈现地图
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
        //将标记呈现在可见的界限内
        bounds.extend(marker.position);
        //给每一个标记添加点击事件
        marker.addListener('click', function () {
            populateInfoWindow(this, largeInfoWindow);
            wikiLink(this);
            toggleBounce(this);
        });
    }
        map.fitBounds(bounds);
    //添加Google api 的自动完成功能
    autocomplete = new google.maps.places.Autocomplete(
        (document.getElementById('autocomplete')), {
            types: ['geocode'],
            componentRestrictions: {country:  "CN"}
        });
    autocomplete.addListener('place_changed', fillInAddress);
    gobutton.click(function() {
        var inputVal = $('#autocomplete').val();
        handleAddress(inputVal);
        renewLi();
    });
    var nave = $(".nave");
    nave.click(function(){
        toggleNave();
    });

};
//input输入并按enter键时出发的函数
var fillInAddress = function () {
    var place = autocomplete.getPlace();
    handleAddress(place.name);
};
//当确认input输入的值时，地图上标记有弹跳反应
var handleAddress = function (place) {
    if (place === undefined) {
        return;
    }
    var targetMarker = null;
    for(var i=0;i<markers.length;i++){
        //先将所有标记去除
        markers[i].setMap(null);
        //如果输入的值等于marker的title，则发生弹跳反应
        if (place == markers[i].title) {
            targetMarker = markers[i];
            targetMarker.setMap(map);
            toggleBounce(targetMarker);
            //设置定时器，在3s以后取消弹跳；
            setTimeout(function() {
                toggleBounce(targetMarker);
            },1500);
        }

    }
};
//在点击"go"button时触发的函数，更新ul列表
var renewLi = function(){
   var lis = $('.location');
    var inputVal = $('#autocomplete').val();
    //遍历所有li元素，将不等于input值的li隐藏，等于input值的li展现，并改变字体颜色
    for (var i= 0;i<lis.length;i++){
        var li = lis[i];
        li.style.display = "none";
        if(li.innerText === inputVal){
            li.style.display = "block";
            li.style.color = "white";
            li.style.cursor = "pointer";
            //增加wikiPedia API 方法
            li.addEventListener("mouseover",function(){
               this.style.color = "red";
            });
            li.addEventListener("mouseout",function(){
                this.style.color = "white";
            });
            li.addEventListener("click",function(){
                wikiBrief(this);
                handleAddress(inputVal);
            });


        }
    }

};
// 设置marker的infoWindow
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
//设置marker弹跳的函数
var toggleBounce = function (marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
};
//设置在infoWindow展现的wiki pedia api
var wikiLink = function(marker){
    var addr = marker.title;
    var wikiHeader = $("#wiki-header");
    var wikiUrl = 'https://zh.wikipedia.org/w/api.php?action=opensearch&search=' +addr+ '&format=json&callback=wikiCallback';
    //如果8秒后无反应，则显示失败加载；
    var wikiRequestTimeOut = setTimeout(function(){
        wikiHeader.append('<div> failed to get wikipedia sources</div>');
        toggleBounce(marker);
    },8000);
    $.ajax(wikiUrl, {
        dataType: 'jsonp',
        success: function (response) {
            console.info(response);
            var article = response[1][0];
            var url = response[3][0];
            //如果异步请求成功，则在infoWindow中添加wiki链接
            wikiHeader.append('<div>' + '<a href = "'+url + '">'+article+ '</a>' + '维基百科'+'</div>');
            //为了避免点击两次marker来取消弹跳，这里设置定时器，在异步请求成功后2s停止弹跳
            setTimeout(function(){
                toggleBounce(marker);
            },2000);
            //如果异步请求成功，则清除之前设置的wikiRequestTimeOut函数
            clearTimeout(wikiRequestTimeOut)
        }
    })
};
//点击go button时触发的函数，获取维基百科的相关内容
var wikiBrief = function(li) {
    var addr = li.innerText;
    var wikiUrl ='https://zh.wikipedia.org/w/api.php?action=parse&format=json&page='+ addr + '&callback=wikiCallback';
    $.ajax({
        url: wikiUrl,
        dataType: 'jsonp',
        type: 'GET',
       async: false,
        //contentType: "application/json; charset=utf-8",
       headers: {'Api-User-Agent': 'Example/1.0'},
        success: function (data) {
           // console.info(data);
            var summary = data.parse.text['*'];
            li.innerHTML +=  "<div id='wikiSummary'>" + summary + "</div>";
            //var markersA = $("a");
            //想改变href的值，但不知为什么变不了
            // for(var i = 0;i<markersA.length;i++){
            //     var markerA = markersA[i];
                // var hrefVal = markerA.getAttribute("href");
                // hrefVal.replace(/wiki/,"https://zh.wikipedia.org/wiki/");
                // markerA.setAttribute("href","https://zh.wikipedia.org/wiki/"+ attr);
            // }
            clearTimeout(wikiRequestTimeOut)
            }
    }).fail(function(response){
        var error = response.error.info;
        li.innerHTML += "<div> Request failed:"+ error+"</div>";
        clearTimeout(wikiRequestTimeOut)
    });
    var wikiRequestTimeOut = setTimeout(function () {
        //li.append('<div> failed to get wikipedia sources</div>');
        li.innerHTML += "<div> 请求超时，请重新尝试</div>";
    },8000);
};

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
    function geolocate() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
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
var toggleNave = function () {
    var left= $(".left");
    var right = $(".right");
    var map = $(".mapStyle");
    if (left.length) {
        left.removeClass("left").addClass("leftuv");
        right.removeClass("right").addClass("rightuv");
        map.removeClass("mapStyle").addClass("mapuv");
    } else {
        $(".leftuv").removeClass("leftuv").addClass("left");
        $(".rightuv").removeClass("rightuv").addClass("right");
        $(".mapuv").removeClass("mapuv").addClass("mapStyle");
    }
};
