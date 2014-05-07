var app = app || {};

$(function() {

    var data = {
        "wmsService": "geoserver/", // Geoserver Url with trailing slash
        "wmsServiceCache": "geoserver/", // Geoserver Web Cache Url with trailing slash
        "llpgSearch": "", // Full LLPG search Url
        "tileFormat": "image/png", // png or jpeg
        "map": {
            "bounds": {
                "left": 0, // easting
                "bottom": 0, // northing
                "right": 0, // easting
                "top": 0 // northing
            },
            "center": {
                "x": 0, // easting
                "y": 0, // northing
                "z": 0 // zoom level
            },
            "projection": "EPSG:27700",
            "units": "m"
        }
    }; // data 

    window.nbcMapApp = new app.View.MapView(data);

});