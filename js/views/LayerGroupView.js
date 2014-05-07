var app = app || {};

app.View.LayerGroupView = Backbone.View.extend({
    className: "layers-control__group js-accordion",
    template: $("#layerGroupTemplate").html(),

    initialize: function() {
        this.model.set("layerCollection", new app.View.LayerCollectionView(this.model.get("layers"), this.model.get("serviceUrl")));

        this.listenTo(this.model.get("layerCollection"), "layer:loaded", this.updateProgress);
        this.listenTo(this.model.get("layerCollection"), "layer:", this.updateProgress);
        this.render();
    },

    render: function() {

        //parse the template
        var templ = _.template(this.template);

        // render this views template and the child collection view too
        this.$el.html(templ(this.model.toJSON())).find(".js-accordion-content").html(this.model.get("layerCollection").render().el);
        
        return this;
    },

    updateProgress: function() {
        this.model.trigger("layer:loaded");
    }

});