var app = app || {};

app.View.FeatureCollectionView = Backbone.View.extend({
    el: "#features",

    initialize: function(request) {

        this.collection = new app.Collection.FeatureCollection();
        this.html = "";
        this.e = request.e;
        this.request = request;

        //request the features from the server
        OpenLayers.Request.GET({
            url: request.geoserver + request.workspace +"/wms",
            params: request.params,
            scope: this,
            success: this.response,
            failure: this.response
        });

        // listen for reset events and render the collection
        this.collection.on('reset', this.render, this);
    },

    render: function() {
        this.collection.each(function(feature) {
            this.renderFeature(feature);
        }, this);

        app.Events.Manager.trigger("featureCollection:show", this.e,this.html);
    },

    renderFeature: function(feature) {
        var featureView = new app.View.FeatureView({
            model: feature
        });

        this.html += featureView.render().el.innerHTML;
    },

    response: function(data) {
				var self = this;
        // parse only the feature properties - the interesting bits
        var features = _.map($.parseJSON(data.responseText).features, function(feature) {
						var name = self.getLayerNameFromFeatureId(feature.id);
            return {id: name, properties: feature.properties};
        });

        // reset the collection
        this.collection.reset(features);
    },

		getLayerNameFromFeatureId: function(id) {
			var idArr = id.split('.');
			return idArr[0].replace(/([a-z])([A-Z])/g, '$1 $2');
		}

});
