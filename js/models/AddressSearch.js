var app = app || {
    Model: {},
    View: {},
    Collection: {}
};

app.Model.AddressSearch = Backbone.Model.extend({
    defaults: {
        value: "",
        results: []
    }
});