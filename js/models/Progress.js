var app = app || {
    Model: {},
    View: {},
    Collection: {}
};

app.Model.Progress = Backbone.Model.extend({
    defaults: {
        current: 0,
        total: 0,
        complete: false
    }
});