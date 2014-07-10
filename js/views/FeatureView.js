var app = app || {};

app.View.FeatureView = Backbone.View.extend({
    //model: Map,
    tagName: "li",
    className: "feature",
    template: $("#featureTemplate").html(),

    initialize: function(feature) {
        this.model = new app.Model.Feature(feature);
        this.render();
    },

    render: function() {
        //parse the template
        var templ = _.template(this.template);

        // set this elements html to the model rendered in the template
        this.$el.html(templ({
            feature: this.model.toJSON()
        }));

        return this;
    }


});
