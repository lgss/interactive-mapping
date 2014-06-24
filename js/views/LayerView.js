var app = app || {};

app.View.LayerView = Backbone.View.extend({
    tagName: "li",

    template: $("#layerTemplate").html(),

    events: {
        "click input": "checkboxToggleLayer"
    },

    initialize: function() {
        var layer = this.model.get("openLayer");

        // bind OpenLayers events to the Layer
        layer.events.register("loadstart", this, this.layerLoading);
        layer.events.register("loadend", this, this.layerLoaded);

        this.on("change:visibility", this, this.render);
        this.listenTo(this.model, "change:legend", this.render);

        this.render();
    },

    render: function() {

        //parse the template
        var templ = _.template(this.template);
        // set this elements html to the model rendered in the template
        this.$el.html(templ(this.model.toJSON()));
        return this;
    },

    checkboxToggleLayer: function(e) {
        // toggle the models visibility property
        if (this.$el.find('input[type="checkbox"]')[0].checked) {
            this.model.showLayer();
            app.Events.Manager.trigger("layer:active", true, this.model);
        } else {
            this.model.hideLayer();
            app.Events.Manager.trigger("layer:active", false, this.model);
        }
    },

    zoomToggleLayer: function(e) {
        // toggle the models visibility and enabled properties
    },

    layerLoading: function(e) {
        this.model.trigger('layer:loading');
    },

    layerLoaded: function(e) {
        this.model.set("loaded", true);
        this.model.trigger('layer:loaded');
        app.Events.Manager.trigger("layer:loaded", this.model);
        this.render();
    }


});