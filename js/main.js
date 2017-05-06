var MapViewModel = function (){
    this.detailsEnabled = ko.observable(false);

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