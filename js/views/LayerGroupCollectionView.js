var app = app || {};

app.View.LayerGroupCollectionView = Backbone.View.extend({
    className: ".layerGroup",
    el: "#layers-control",
    clearLayersTemplate: $("#layerClearTemplate").html(),

    events: {
        "click .js-clear": "clearLayers"
    },

    initialize: function(layerGroups, serviceUrl) {
        this.serviceUrl = serviceUrl;

        // create the collection to hold our layer group models
        this.collection = new app.Collection.LayerGroupCollection(layerGroups);

        // add the service url to each layer group
        this.collection.each(function(layerGroup) {
            layerGroup.set("serviceUrl", serviceUrl);
        }, this);

        // listens to the event chain through the collections
        this.listenTo(this.collection, "layer:loaded", this.updateProgress);

        this.activeLayers = [];

        app.Events.Manager.on("layer:active", this.handleLayer, this);
        
        this.render();
    },

    getLayers: function() {
        var layers = [];

        this.collection.each(function(model) {
            var collection = model.get("layerCollection").collection; // layer
            layers = layers.concat(collection.models);
        });

        return layers;
    },

    render: function() {
        this.$el.html("");

        // add clear button
        var templ = _.template(this.clearLayersTemplate);
        this.$el.append(templ());


        this.collection.each(function(layerGroup) {
            this.renderLayerGroup(layerGroup);
        }, this);
        return this;
    },

    renderLayerGroup: function(layerGroup) {
        var layerGroupView = new app.View.LayerGroupView({
            model: layerGroup
        });
        this.$el.append(layerGroupView.render().el);
    },

    updateProgress: function() {
        // count the number of loaded layers
        var loaded = _.filter(this.getLayers(), function(layer){
            return layer.get("loaded");
        });
    },

    handleLayer: function(active, model) {
        if(active) {
            this.activeLayers.push(model);
        } else {
            var index = _.indexOf(this.activeLayers, model);
            if(index >= 0) {
                this.activeLayers.pop(index);
            }
        }
        this.toggleClearButton();
    },

    toggleClearButton: function() {
        var $clearBtn = this.$el.find(".js-clear");
        
        if(this.activeLayers.length > 0) {
            if(!$clearBtn.hasClass("is-active")) {
                $clearBtn.addClass("is-active");
            }
        } else {
            $clearBtn.removeClass("is-active");
        }
    },

    clearLayers: function(e) {
        e.preventDefault();

        _.each(this.activeLayers, function(model){
            model.hideLayer();
        });

        this.activeLayers = [];

        this.toggleClearButton();
    }

});