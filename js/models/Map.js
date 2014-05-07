var app = app || {
    Model: {},
    View: {},
    Collection: {}
};

app.Model.Map = Backbone.Model.extend({
    defaults: {
        // map defaults
        center: 0,
        measuringActive: false
    },

    initialize: function(mapOptions) {

        var options = mapOptions || {
            div: this.el,
            allLayers: true
        };

        var osMap = new OpenSpace.Map("map",options);

        this.set("openLayerMap", osMap);
    }

});