var app = app || {
    Model: {},
    View: {},
    Collection: {},
    Events: {},
    Router: {}
};

app.Router.Router = Backbone.Router.extend({

    routes: {
        "layer/:name":                 "layer",    // #layer/publicopenspace
        "category/:name":								"category"
    },

    layer: function(name) {
        app.Events.Manager.trigger("route:layer", name);
    },

    category: function(name) {
        app.Events.Manager.trigger("route:category", name);
    }
});

