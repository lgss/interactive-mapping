var app = app || {
    Model: {},
    View: {},
    Collection: {}
};

app.Model.Statistic = Backbone.Model.extend({
    defaults: {
        title: "Distance",
        value: "0",
        unit: "km",
        sup: ""
    }
});