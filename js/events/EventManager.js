var app = app || {
    Model: {},
    View: {},
    Collection: {},
    Events: {},
    Router: {}
};

app.Events.Manager = _.extend({}, Backbone.Events);