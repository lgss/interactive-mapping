var app = app || {
    Model: {},
    View: {},
    Collection: {}
};

app.Model.Layer = Backbone.Model.extend({
    defaults: {
        type: "",
        showControl: true,
        visibility: false,
        loaded: true,
        enabled: true,
        legend: false
    },

    initialize: function(layer) {

        var self = this;
        var ol = {
            title: layer.name,
            options: {},
            params: {}
        };
        var lay;

        // set the layers default option
        ol.options.visibility = this.defaults.visibility;

        if (layer.type === "WMS") {

            ol.service = layer.service + "wms";

            ol.type = layer.type;

            ol.params.layers = layer.name;
            //ol.params.styles = "";
            ol.params.tiled = true;
            ol.params.exceptions = "application/json";
            ol.params.strategies = [new OpenLayers.Strategy.Fixed({preload: true})];
            ol.params.format = 'image/png';
            ol.params.transparent = true;


            ol.options = {
                        buffer: 0,
                        displayOutsideMaxExtent: true,
                        isBaseLayer: false,
                        visibility: this.defaults.visibility,
                        yx: {
                            "EPSG:27700": true
                        },
                        protocol: new OpenLayers.Protocol.WFS({
                            "featureType": layerTitle,
                            "url": ol.service,
                            "geometryName": "the_geom",
                            "featurePrefix": "WebMapping",
                            "srsName": "EPSG:27700",
                            "version": "1.1.0"
                        })
                    };

            lay = new OpenLayers.Layer[ol.type](
                ol.title,
                layer.service + "wms",
                ol.params,
                ol.options
            );

            this.set("openLayer", lay);
            //self.setLegend();
        } else {
            ol.service = layer.service + "wfs";
            ol.type = "Vector";

            // create the style object for the vector
            var style = new OpenLayers.StyleMap({
                rendererOptions: {yOrdering: true}
            });

            // add the style to the configured attributes
            ol.options.styleMap = style;

            // remove the spaces from the layer title
            var layerTitle = this.trim(layer.title);

            // create the vector protocol object
            var protocol = new OpenLayers.Protocol.WFS({
                            "featureType": layerTitle,
                            "url": ol.service,
                            "geometryName": "the_geom",
                            "featurePrefix": "WebMapping",
                            "srsName": "EPSG:27700",
                            "version": "1.1.0"
                        });

            ol.options.protocol = protocol;

            ol.options.visibility = this.defaults.visibility;

            // add strategy
            ol.options.strategies = [new OpenLayers.Strategy.Fixed({
                preload: true
            })];

            ol.options.resolutions = [200,100,50,10,5,2.5,1.25,0.5,0.25];

            //ol.options.tileSize = new OpenLayers.Size(250,250);

            lay = new OpenLayers.Layer[ol.type](
                layer.title,
                ol.options
            );

            this.set("openLayer", lay);


        }
        this.getSLD(layer.service, layer.title);
    },

    getSLD: function(webservice, layerTitle) {
			var self = this;
			var sldUrl = webservice + "styles/"+self.trim(layerTitle)+".sld";

            OpenLayers.Request.GET({
                url: sldUrl,
                success: function(req) {
                    var format = new OpenLayers.Format.SLD();
                    self.sld = format.read(req.responseText || req.responseXML);
                    self.setSLD(layerTitle);
                }
            });
    },

    setSLD: function(layerTitle) {


			if(this.get("type") !== "WMS") {

				var style = this.sld.namedLayers[layerTitle].userStyles[0];
				this.get("openLayer").styleMap.styles["default"] = style;
			}

			this.setLegend();
    },

    showLayer: function() {
        this.set("visibility", true);
        this.get("openLayer").setVisibility(true);
    },

    hideLayer: function() {
        this.set("visibility", false);
        this.get("openLayer").setVisibility(false);
    },

    disableLayer: function() {
        this.set("enabled", false);
    },

    enableLayer: function() {
        this.set("enabled", true);
    },

    colorLuminance: function(hex, opacity) {

        hex = String(hex).replace(/[^0-9a-f]/gi, '');

        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }

        opacity = opacity || 1;

        var rgba = "rgba(", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            rgba += (c + ",");
        }

        rgba += (opacity + ");");

        return rgba;
    },

    setLegend: function() {
        var self = this,
            layerStyle = this.sld.namedLayers[this.get("title")].userStyles[0],
            rules = layerStyle.rules,
            legend = [];

        _.each(rules,function(rule) {

            var legendItem = {
                name: rule.filter ? rule.filter.value : "default",
                properties: []
            };

            var ruleStyles = rule.symbolizer;

            for (var style in ruleStyles) {

                var styleObj = ruleStyles[style];

                for(var prop in styleObj) {

                    switch (prop) {
                        case "fillColor":
                            legendItem.properties.push("background-color:" + styleObj[prop] + ";");
                        break;
                        case "fillOpacity":
                            if(styleObj.fillColor) {
                                var bgColour = self.colorLuminance(styleObj.fillColor, styleObj[prop]);
                                legendItem.properties.push("background-color:" + bgColour + ";");
                            }
                        break;
                        case "strokeColor":
                            legendItem.properties.push("border-color:" + styleObj[prop] + ";");
                        break;
                        case "strokeWidth":
                            legendItem.properties.push("border-width: 2px;");
                        break;
                        case "strokeDashstyle":
                            legendItem.properties.push("border-style: dashed;");
                        break;
                    }

                }

                legendItem.css = legendItem.properties.join(" ");
            }

            legend.push(legendItem);

        });
        this.set("legend", legend);
    },

    trim: function(str) {
        str = str.replace(/\s+/g, "");
        return str;
    }

});
