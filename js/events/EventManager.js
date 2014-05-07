var app = app || {
    Model: {},
    View: {},
    Collection: {},
    Events: {}
};

app.Events.Manager = _.extend({}, Backbone.Events);