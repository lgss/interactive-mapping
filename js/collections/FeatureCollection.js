var app = app || {};

app.Collection.FeatureCollection = Backbone.Collection.extend({
    model: app.Model.Feature
});