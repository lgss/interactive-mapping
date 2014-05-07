var app = app || {};

app.Collection.LayerCollection = Backbone.Collection.extend({
    model: app.Model.Layer
});