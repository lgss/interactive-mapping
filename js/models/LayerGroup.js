var app = app || {
    Model: {},
    View: {},
    Collection: {}
};

app.Model.LayerGroup = Backbone.Model.extend({
    defaults: {
        title: "Layer Group"
    }
});