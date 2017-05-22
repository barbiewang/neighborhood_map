/*
 这是这个使用knockOut的view Model
 */
"use strict";
//预先定义数组及数组的值；
var touristPlaces = ["世界之窗","欢乐谷","宝安机场","深圳湾公园","羊台山公园","莲花山公园"];
var gobutton = $('#go');

var MapViewModel = function (){
    this.detailsEnabled = ko.observable(false);
    this.places = ko.observableArray(touristPlaces);//默认显示所有地点
    this.text = ko.observable('');
    this.filterText = ko.observable("");
    this.filterText.subscribe(function(newValue){
        renewLi(newValue);
    });
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
//创建infoWindow
var largeInfoWindow;
var locations = [
    {title: '世界之窗', location: {lat: 22.5347167, lng: 113.9734179}},
    {title: '欢乐谷', location: {lat: 22.5402908,lng: 113.9818588}},
    {title: '宝安机场', location: {lat: 22.647665,lng: 113.821075}},
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
    largeInfoWindow = new google.maps.InfoWindow();
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
        renewLi(inputVal);//这里可有可无，因为enter键也可以实现相应功能
    });
    //点击时改变地左右侧布局
    var nave = $(".nave");
    nave.click(function(){
        toggleNave();
    });

};
//这个函数整合和所有li点击时会发生的事件
var liClick = function(li){
    var val = li.innerText;
    for(var j = 0;j<markers.length;j++){
        var marker = markers[j];
        if(val == marker.title){
            toggleBounce(marker);
            populateInfoWindow(marker, largeInfoWindow);
            wikiLink(marker);
            wikiBrief(li);
        }

    }
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
            //设置定时器，在1.5s以后取消弹跳；
            setTimeout(function() {
                toggleBounce(targetMarker);
            },1500);
        }

    }
};
//在点击"go"button时触发的函数，更新ul列表
var renewLi = function(newValue){
    var lis = $('.location');
    var inputVal = newValue;
    $('#wikiSummary').remove();
    //遍历所有li元素，将不等于input值的li隐藏，等于input值的li展现，并改变字体颜色
    for (var i= 0;i<lis.length;i++){
        var li = lis[i];
        li.style.display = "none";
        if(checkValue(li.innerText,inputVal)){
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
                // wikiBrief(this);
                // handleAddress(inputVal);
                liClick(this);
            });
        }
    }
};
//比较input的输入值和列表的值，当列表中含有输入的字符串，则显示出来
function checkValue(value, filterText) {
    if (filterText.length > 0){
        return (value.toLowerCase().indexOf(filterText.toLowerCase()) > -1);
    } else {
        return true;
    }
}
// 设置marker的infoWindow
var populateInfoWindow = function(marker,infoWindow){
    if(infoWindow.marker !== marker){
        infoWindow.marker = marker;
        var content = "<div id = 'wiki-header' style='color:black;'>"+marker.title+"</div>";
        infoWindow.setContent(content);
        infoWindow.open(map,marker);
        infoWindow.addListener('closeclick',function(){
			infoWindow.marker = null;
//             infoWindow.setMarker(null);
        });


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
        $(".wikiLink").remove();
        wikiHeader.append('<div class="wikiLink"> failed to get wikipedia sources</div>');
        toggleBounce(marker);
    },3000);
    $.ajax(wikiUrl, {
        dataType: 'jsonp',
        success: function (response) {
            var article = response[1][0];
            var url = response[3][0];
            //如果异步请求成功，则在infoWindow中添加wiki链接
            $(".wikiLink").remove();
            wikiHeader.append('<div class="wikiLink">' + '<a href = "'+url + '">'+article+ '</a>' + '维基百科'+'</div>');
            //为了避免点击两次marker来取消弹跳，这里设置定时器，在异步请求成功后2s停止弹跳
            setTimeout(function(){
                toggleBounce(marker);
            },2000);
            //如果异步请求成功，则清除之前设置的wikiRequestTimeOut函数
             clearTimeout(wikiRequestTimeOut)
        }
    })
};
//设置地图未能加载的提示函数
var mapError = function(){
    alert("未能加载Google地图，请刷新重试");
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
            var summary = "";
            if(data.parse.text['*']){
                summary = data.parse.text['*'].toString().replace(/\/wiki\//g, "https://zh.wikipedia.org/wiki/");
            }
           // li.innerHTML +=  "<div id='wikiSummary'>" + summary + "</div>";
           //  li.after("<div id='wikiSummary'></div>");
            $('#wikiSummary').remove();
            $("<div id='wikiSummary'>" +  summary + "</div>").insertAfter(li);
            // li.after($("<div id='wikiSummary'>" +  summary + "</div>"))
            // $("#wikiSummary").innerHTML += "<div>" + summary + "</div>";
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
    // }).fail(function(response){
    //     var error = response.error.info;
    //     li.innerHTML += "<div> Request failed:"+ error+"</div>";
    //     clearTimeout(wikiRequestTimeOut)
    });
    var wikiRequestTimeOut = setTimeout(function () {
        //li.append('<div> failed to get wikipedia sources</div>');
        $('#wikiSummary').remove();
        $("<div id='wikiSummary'>" +  "请求超时，请重新尝试" + "</div>").insertAfter(li);
       // li.innerHTML += "<div> 请求超时，请重新尝试</div>";
    },3000);
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
//该函数用于增加左侧栏的宽度，以便在数据多的时查看
var toggleNave = function () {
    // var left= $(".left");
    // var right = $(".right");
    // var mapDiv = $(".mapStyle");
    // if (left.length) {
    //     left.removeClass("left").addClass("leftuv");
    //     right.removeClass("right").addClass("rightuv");
    //     mapDiv.removeClass("mapStyle").addClass("mapuv");
    // } else {
    //     $(".leftuv").removeClass("leftuv").addClass("left");
    //     $(".rightuv").removeClass("rightuv").addClass("right");
    //     $(".mapuv").removeClass("mapuv").addClass("mapStyle");
    // }
    var left = $("#leftSide");
    var right = $("#rightSide");
    left.width("80%");
    right.width("20%");
};
//隐藏或显示左侧栏
// var closeNav = function(){
//     var left= $(".left");
//     var right = $(".right");
//     var mapDiv = $(".mapStyle");
//     left.hide();
//     right.width("100%");
//     mapDiv.width ("100%");
//
//
// };
// var openNav = function(){
//     var left= $(".left");
//     var right = $(".right");
//     var mapDiv = $(".mapStyle");
//     left.show();
//     right.width("75%");
//     mapDiv.width ("75%");
// };
//隐藏或显示左侧栏
var closeNav = function(){
document.getElementById("leftSide").style.width = "0";
};

//当用toggleNave函数拉伸了左侧栏的宽度后，可用该函数恢复正常宽度；
var openNav = function(){
    document.getElementById("leftSide").style.width = "20%";
};
