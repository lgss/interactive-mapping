var app = app || {};

app.View.AddressView = Backbone.View.extend({
    //model: Map,
    tagName: "li",
    className: "addressResultItem",
    template: $("#addressSearchItemTemplate").html(),

    events: {
        "click a": "clicked"
    },

    initialize: function() {
        this.render();
    },

    render: function() {
        //parse the template
        var templ = _.template(this.template);

        // set this elements html to the model rendered in the template
        this.$el.html(templ(this.model.toJSON()));

        return this;
    },

    clicked: function(e) {
        e.preventDefault();
        app.Events.Manager.trigger("addressSearch:addressClicked", this.model);
        app.Events.Manager.trigger("addressView:addressClicked", false);
    }


});