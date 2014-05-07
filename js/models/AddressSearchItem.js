var app = app || {
    Model: {},
    View: {},
    Collection: {}
};

app.Model.AddressSearchItem = Backbone.Model.extend({
    defaults: {
        name: "",
        number: "",
        number_and_street: "",
        easting: "",
        northing: "",
        street: "",
        postcode: ""
    }
});