var app = app || {};

$(function() {

    var data = {
        "wmsService": "http://localhost:8080/geoserver-25/",
        "wmsServiceCache": "http://localhost:8080/geoserver-25/",
        "llpgSearch": "http://selfserve.northampton.gov.uk/mycouncil/PropertySearch",
        "tileFormat": "image/png",
        "map": {
            "bounds": {
                "left": 400000.0,
                "bottom": 200000.0,
                "right": 500000.0,
                "top": 300000.0
            },
            "center": {
                "x": 475579,
                "y": 260488,
                "z": 5
            },
            "projection": "EPSG:27700",
            "units": "m"
        }
    }; // data

    window.nbcMapApp = new app.View.MapView(data);
    window.nbcMapRouter = new app.Router.Router();
    Backbone.history.start();
});
