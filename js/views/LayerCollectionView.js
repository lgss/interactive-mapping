var app = app || {};

app.View.LayerCollectionView = Backbone.View.extend({

    tagName: "ul",

    initialize: function(layerGroup, serviceUrl) {

        // add the service url to each layers properties
        _.each(layerGroup, function(obj) {
            obj.service = serviceUrl;
        });

        // create the collection
        this.collection = new app.Collection.LayerCollection(layerGroup);

        this.listenTo(this.collection, 'layer:loaded', this.updateProgress); // each time a layer loads, update the progress bar
        //this.listenTo(this.progress, 'progress:complete', this.clearLayers); // each time a layer loads, update the progress bar
        this.listenTo(this.collection, 'change:visibility change:enabled', this.render); // each time a layers visibility status changes, re-render the view
        //this.on('layers:clear', this.clearLayers, this);

        this.render();
    },

    render: function() {
        if (this.currentView){
            this.currentView.close();
        }

        this.$el.html("");

        this.collection.each(function(layer) {

            if (!layer.get("openLayer").isBaseLayer) {
                this.renderLayer(layer);
            }

        }, this);
        return this;
    },

    renderLayer: function(layer) {
        var layerView = new app.View.LayerView({
            model: layer
        });
        this.$el.append(layerView.render().el);
    },

    updateProgress: function() {
        this.trigger('layer:loaded');
        this.toggleLayers();
    },

    toggleLayers: function() {
        this.collection.each(function(layer) {
						console.log(layer);

            // clear the layer visibility of all non-Base-layers
            if (!layer.get("openLayer").isBaseLayer && layer.get("openLayer").calculateInRange()) {
                layer.enableLayer();
                console.log("ENABLED");
            } else if (!layer.get("openLayer").isBaseLayer && !layer.get("openLayer").calculateInRange()) {
                layer.disableLayer();
                console.log("DISABLED");
            }

        }, this);
    },

    clearLayers: function() {
        this.collection.each(function(layer) {

            // clear the layer visibility of all non-Base-layers
            if (!layer.get("openLayer").isBaseLayer) {
                layer.set("visibility", false);
            }

        }, this);
    }

});
