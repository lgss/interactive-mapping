var app = app || {};

app.View.MeasuringToolCollectionView = Backbone.View.extend({
    el: "#tools",

    initialize: function(map) {

        this._map = map;
        this.distanceView = new app.View.StatisticView();

        // can refactor to deal with elsewhere if possible
        this.getRenderer();
        this.setStyle();

        // set up the collection of measurement tools
        this.collection = new app.Collection.MeasuringToolCollection([{
                name: "Measure a Distance",
                activeName: "Stop Measuring",
                statName: "Distance",
                control: new OpenLayers.Control.Measure(
                    OpenLayers.Handler.Path, {
                        persist: true,
                        handlerOptions: {
                            layerOptions: {
                                renderers: this.renderer,
                                styleMap: this.styleMap
                            }
                        },
                        immediate: true
                    }
                )
            }, {
                name: "Measure an Area",
                statName: "Area",
                activeName: "Stop Measuring",
                control: new OpenLayers.Control.Measure(
                    OpenLayers.Handler.Polygon, {
                        persist: true,
                        handlerOptions: {
                            layerOptions: {
                                renderers: this.renderer,
                                styleMap: this.styleMap
                            }
                        },
                        immediate: true
                    }
                )
            }
        ]);

        // add the event listeners to the controls
        // use this view as the context for callbacks
        this.collection.each(function(tool) {
            var control = tool.get("control");
            control.events.on({
                "click" : this.handleMeasurements,
                "touchend" : this.handleMeasurements,
                "measure": this.handleMeasurements,
                "measurepartial": this.handleMeasurements,
                "featureadded": this.handlePoint,
                scope: this
            });

            //add the controls to the map
            this._map.addControl(control);

            // if the control has its own layer, add that too
            if (control.layer) {
                control.map.addLayer(control.layer);
            }

        }, this);

        // add the seperate event listeners to handle toggling
        this.listenTo(this.collection, "control:changed", this.toggleControl);

        app.Events.Manager.on("accordions:closed", this.deactivateControls, this);
        this.render();
    },

    render: function() {
        this.$el.html("");

        this.collection.each(function(tool) {
            this.renderTool(tool);
        }, this);

        return this;
    },

    renderTool: function(tool) {
        var toolView = new app.View.MeasuringToolView({
            model: tool
        });
        this.$el.append(toolView.render().el);
    },

    setStyle: function() {

        // style the sketch  all fancy like
        var sketchSymbolizers = {
            "Point": {
                pointRadius: 4,
                graphicName: "circle",
                fillColor: "white",
                fillOpacity: 1,
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#333333"
            },
            "Line": {
                strokeWidth: 3,
                strokeOpacity: 1,
                strokeColor: "#ff0000"
            },
            "Polygon": {
                strokeWidth: 3,
                strokeOpacity: 1,
                strokeColor: "#ff0000",
                fillColor: "white",
                fillOpacity: 0.3
            }
        };

        var style = new OpenLayers.Style();

        style.addRules([new OpenLayers.Rule({
            symbolizer: sketchSymbolizers
        })]);

        this.styleMap = new OpenLayers.StyleMap({
            "default": style
        });
    },

    getRenderer: function() {
        // allow testing of specific renderers via "?renderer=Canvas", etc
        var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
        this.renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
    },

    handleMeasurements: function(event) {

        var newStat = {
            value: event.measure.toFixed(2),
            unit: event.units,
            sup: ""
        };
        if (event.order !== 1) {
            newStat.sup = "2";
        }
        this.distanceView.updateStat(newStat);
    },

    handlePoint: function(event) {

        event.object.insertXY(event.feature.geometry.x, event.feature.geometry.y);

        var newStat = {
            title: "Coordinates",
            value: event.feature.geometry.x + "," + event.feature.geometry.y,
            unit: "",
            sup: ""
        };

        this.distanceView.updateStat(newStat);
    },

    deactivateControls: function() {
        this.collection.each(function(tool) {

            if (tool.get("control").layer) {
                tool.get("control").layer.destroyFeatures();
            }
            tool.get("control").deactivate();
            
            tool.set("active", false, {
                silent: true
            });
        });
        app.Events.Manager.trigger("measuring:active",false);
    },

    toggleControl: function(model) {
        // silently deactivate all the controls
        this.deactivateControls();
        
        if (model.previous("active")) {
            model.get("control").activate();
            
            model.set("active", true, {
                silent: true
            });

            app.Events.Manager.trigger("measuring:active",true, model.get("statName"));
        }

        this.render();
    }

});