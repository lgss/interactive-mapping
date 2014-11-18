var app = app || {};

app.View.MapView = Backbone.View.extend({
    //model: Map,
    el: "body",
    mapEl: "#map",
    template: $("#mapTemplate").html(),

    events: {
        "click #clearLayers": "clearLayers",
        "click .js-accordion-title": "accordionize"
    },


    initialize: function(config, mapEl) {

        // set some additional view properties
        this.mapEl = mapEl || this.mapEl;
        this.$mapEl = $(this.mapEl);
        this.geoserver = config.wmsService;
        this.photosDir = config.photosDir;
        this.workspace = config.workspace;
        var bounds = new OpenLayers.Bounds(395000, 210000, 572000, 328000);
        var panZoom = new OpenLayers.Control.PanZoomBar({
        slideRatio: 0.25,
        zoomWorldIcon: true,
        forceFixedZoomLevel: true
    });
        // set the map options from the config argument
        var mapOptions = /*{
            restrictedExtent: new OpenLayers.Bounds(config.map.bounds.left,config.map.bounds.bottom,config.map.bounds.right,config.map.bounds.top),
            resolutions: [50, 10, 5, 4, 2.5, 2, 1],
            projection: "EPSG:27700",
            center: new OpenLayers.LonLat(config.map.center.x, config.map.center.y),
            zoom: config.map.center.z

        };*/
        {
            fallThrough: true,
            tileSize: new OpenLayers.Size(300, 300),
            maxExtent: bounds,
            restrictedExtent: new OpenLayers.Bounds(435000, 200000, 523000, 338000),
            projection: "EPSG:27700",
            units: 'm',
            controls: [new OpenLayers.Control.Navigation({
            handleRightClicks: true,
            zoomWheelEnabled: true,
            dragPanOptions: {
                interval: 100,
                enableKinetic: true
            }
        }), panZoom, new OpenLayers.Control.ScaleLine(), new OpenLayers.Control.MousePosition({
            numDigits: 1
        }), new OpenLayers.Control.KeyboardDefaults()],
            resolutions: [150, 55, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125]
        };

        // set the model
        this.model = new app.Model.Map(mapOptions);

        // create the marker icon and set as a property within the model
        var size = new OpenLayers.Size(36, 36);
        var offset = new OpenLayers.Pixel(-18, -36);
        var icon = new OpenLayers.Icon('img/pin.png', size, offset);
        this.model.set("icon", icon);

        // cache a reference to the map object to save lookups
        this._map = this.model.get("openLayerMap");

        // go and get base layers from Geoserver
        //this.getLayersFromService(this.geoserver, this.geoserver, this.getBaseLayersFromService, this);
        this.getBaseLayersFromService('','',this);

        // go and get overlays from Geoserver
        this.getLayersFromService(this.geoserver, this.geoserver, this.getOverlaysFromService, this);

        // create some measuring controls and attach them to the map
        this.model.set("measuringControls", new app.View.MeasuringToolCollectionView(this._map));
        this.model.set("addressSearch", new app.View.AddressSearchView());

        // event listener for this._map clicks
        this._map.events.register("click", this, this.handleClick);
        this._map.events.register("touchend", this, this.handleClick);
        this._map.events.register("zoomend", this, this.handleZoom);
        app.Events.Manager.on("addressSearch:postcode:success", this.showPostCode, this);
        app.Events.Manager.on("addressSearch:addressClicked", this.showAddress, this);
        app.Events.Manager.on("featureCollection:show", this.showFeatures, this);
        app.Events.Manager.on("measuring:active", this.setMeasuringToolState, this);
        app.Events.Manager.on("window:resize", this.resizeHandlers, this);
        app.Events.Manager.on("route:layer", this.setDefaultLayer, this);
        app.Events.Manager.on("route:category", this.setDefaultCategory, this);
        app.Events.Manager.on("layer:loaded", this.showDefaultLayer, this);

        // correct pan zoom alignment as you can't move it to another container
        this.alignPanZoom();

        // get a reference to the sidebar
        this.$sidebar = this.$el.find(".app__sidebar__content");

        $(window).on("resize", this.resize);
    },

    setDefaultLayer: function(layerName) {
        this.model.set("defaultLayer", layerName);
    },

    setDefaultCategory: function(categoryName) {
        console.log("category selected");
    },

    setMeasuringToolState: function(active) {
        this.model.set("measuringActive", active);
    },

    centerMap: function(x, y, zoom) {
        this.clearMarkers();
        this.model.get("openLayerMap").setCenter(new OpenLayers.LonLat(x, y), zoom);
        this.panMapTo(x, y);
    },

    panMapTo: function(x, y) {
        var point = new OpenLayers.LonLat(x,y);
        this._map.panTo(point);
    },

    showPostCode: function(result) {
        this.centerMap(result.lon, result.lat, 5);
    },

    eastingNorthingToLatLon: function(easting, northing) {
        var osgb = new LatLonE(easting, northing, LatLonE.datum.OSGB36);
        var wgs84 = osgb.convertDatum(LatLonE.datum.WGS84);  
                                  
        var latWGS = wgs84.lat, 
            lonWGS = wgs84.lon;

        var OSConv = OsGridRef.osGridToLatLon(OsGridRef(easting, northing));

            return {
                lat: OSConv.lat,
                lon: OSConv.lon
            };
       
    },

    showAddress: function(model) {
        var easting = model.get("easting");
        var northing =  model.get("northing");
        // console.log(model.get("easting") + " - " + model.get("northing"));
        // var lonLat = this.eastingNorthingToLatLon(easting,northing);
        var point = new OpenLayers.LonLat(easting, northing);

        this.centerMap(easting,northing, 9);
        this.hideAccordions();
        this.showMarker(point);
    },

    showFeatures: function(e, html) {
        var latLon;

        if(e.xy) {
            latLon = this._map.getLonLatFromPixel(e.xy);
        } else {
            latLon = this._map.getLonLatFromPixel({x: e.x, y: e.y});
        }

        var point = new OpenLayers.LonLat(latLon.lon, latLon.lat);

        if(html) {
            this.showMarker(point, html);
        }

        OpenLayers.Event.stop(e);
    },

    addLayers: function() {

        var overlays = this.getAllOverlays();
        var toAdd = this.getOpenLayers(overlays);

        this._map.addLayers(toAdd);

        this.render();
    },

    showDefaultLayer: function(layerModel) {
        var self = this;

        if(this.model.get("defaultLayer")) {
            if(layerModel.get("name").toLowerCase() === self.workspace.toLowerCase() + ":" + this.model.get("defaultLayer").toLowerCase()){
                layerModel.showLayer();
                // var ol = layerModel.get("openLayer");
                // var bounds = ol.getDataExtent();
                // var zoom = ol.getZoomForExtent(bounds);
                // self._map.zoomTo(zoom);
            }
        }
    },


    /**
     * Gets the OpenLayers from an array of Layer models
     * @param  {Array[app.Model.Layer]} arr
     * @return {Array[OpenLayers.OpenLayer]}
     */
    getOpenLayers: function(arr) {
        return _.map(arr,function(model){
            return model.get('openLayer');
        });
    },

    handleClick: function(e) {
        if(!this.model.get("measuringActive")) {
            this.getFeatures(e);
        }
    },

    /**
     * Creates an app.View.FeatureCollectionView
     *
     * @param  {ClickEvent} e
     * @return {Void}
     */
    getFeatures: function(e) {

        this.hideAccordions();
        this.clearMarkers();

        var point = this._map.getLonLatFromPixel(e.xy);

        var visibleLayers = this.getVisibleOverlays();

        if(visibleLayers.length > 0) {

            var queryLayers = this.getLayerNames(visibleLayers);

            var featureRequest = {
                e: e,
                params: {
                    request: "GetFeatureInfo",
                    exceptions: "application/json",
                    bbox: this._map.getExtent().toBBOX(),
                    service: "WMS",
                    info_format: 'application/json',
                    query_layers: queryLayers,
                    feature_count: 50,
                    layers: queryLayers,
                    width: this._map.size.w,
                    height: this._map.size.h,
                    format: "image/png",
                    srs: this._map.getProjection()
                },
                geoserver: this.geoserver,
                workspace: this.workspace
            };

            // handle the wms 1.3 vs wms 1.1 madness
            if (visibleLayers[0].get("openLayer").protocol.version === "1.3.0") {
                featureRequest.params.version = "1.3.0";
                featureRequest.params.j = parseInt(e.xy.x);
                featureRequest.params.i = parseInt(e.xy.y);
            } else {
                featureRequest.params.version = "1.1.1";
                featureRequest.params.x = parseInt(e.xy.x);
                featureRequest.params.y = parseInt(e.xy.y);
            }

            this.featureView = new app.View.FeatureCollectionView(featureRequest);

        }

        OpenLayers.Event.stop(e);
    },

    /**
     * Gets all layers from the Overlays attribute
     * @return Array[app.Model.Layer]
     */
    getAllOverlays: function() {
        // go get the overlays from the group collection view
        var groups = this.model.get("overlays").collection.models; // returns an array of layer groups
        // hold the overlay layers
        var overlays = [];

        for(var x = 0; x < groups.length; x++) {
            var overlayers = groups[x].get("layerCollection").collection.models; // gets an array of layers from the layer collection
            overlays = overlays.concat(overlayers); // adds the array from the layer group to the master array of all layers
        }

        return overlays;
    },

    /**
     * Gets all the visible overlay layers
     * @return Array[app.Model.Layer]
     */
    getVisibleOverlays: function() {
        var overlays = this.getAllOverlays();

        return _.filter(overlays, function(layer) {
            return (!layer.get("openLayer").isBaseLayer && layer.get("openLayer").getVisibility()) ? true : false;
        });
    },

    /**
     * Gets an array containing the name
     * attribute for each of the OpenLayers
     *
     * @param  Array[app.Model.Layer] layers
     * @return Array[String]
     */
    getLayerNames: function(layers) {
        return _.map(layers, function(layer) {
            return layer.get("name");
        });
    },

    /**
     * Adds the overlays to the map
     * @param  {Array} layers      [an array of layer objects]
     * @param  {String} serviceUrl [the WMS service url]
     * @return {void}
     */
    getOverlaysFromService: function(layers, serviceUrl, context) {
        var overlayGroups = [],
						self = this;

        // filter get only the layers that are overlays
        var overlays = _.filter(layers, function(layer){
            layer.isBaseLayer = false;
            return layer.prefix.toLowerCase() === context.workspace.toLowerCase();
        });

				_.each(overlays,function(layer){

						if(layer.abstract) {

							// parse the config object
							var config = $.parseJSON(layer.abstract);

							// set an explicit layer type
							if(config.type === "WMS") {
								layer.type = "WMS";
							}

							// add extensions to the layer obj
							layer.extensions = {};

							if(config.photos) {

								layer.extensions.photos = {
									fileType: config.photos.fileType,
									property: config.photos.property
								};
							}

						}
        });

        // get a unique list of possible layer categories
        var categories = _.uniq(_.map(overlays, function(layer){
            return layer.keywords[0].value;
        }));

        // create a layer group per category and add the layers to the group
        _.each(categories, function(cat){

            var layerGroup = {
                title: cat,
                layers: []
            };

            _.each(overlays,function(layer){
                if(layer.keywords[0].value === layerGroup.title) {
                    layerGroup.layers.push(layer);
                }
            });

            overlayGroups.push(layerGroup);
        });

        // create the overlay layers
        context.model.set("overlays", new app.View.LayerGroupCollectionView(overlayGroups, serviceUrl));
        context.addLayers();
    },

    getBaseLayersFromService: function(layers, serviceUrl, context) {
        /*var baseGroup = [];

        baseGroup = _.filter(layers, function(layer){
            layer.isBaseLayer = true;
            layer.type = "WMS";
            layer.service = serviceUrl;
            return layer.prefix === "Base";
        });

        var baseLayers = [];

        _.each(baseGroup, function(layer){
            var layerModel = new app.Model.Layer(layer);
            baseLayers.push(layerModel.get("openLayer"));

        });*/

        
        var wmsService = "http://maps.northamptonshire.gov.uk/InteractiveMappingWMS/GetMap.ashx";
        var bounds = new OpenLayers.Bounds(395000, 210000, 572000, 328000);
        var ncc = new OpenLayers.Layer.WMS("NCC", 
            wmsService, 
            {
                layers: "BaseMap",
                format: "image/gif",
                v: "1"
            }, {
                buffer: 1,
                transitionEffect: "resize",
                baseLayer: true
            });
        this._map.addLayer(ncc);
        //this._map.render();
        this._map.zoomToMaxExtent();
        context.centerMap('475579', '260488', 4);
    },

    /**
     * Gets all the available layers using the WMS web service
     * within Geoserver.
     *
     * @param  {String}   serviceUrl [the base url to the wms service]
     * @param  {Function} callback   [the method to call once ajax has completed]
     * @return {Array}               [an array of layers from the WMS service]
     */
    getLayersFromService: function(serviceUrl, serviceUrlCache, callback, context) {

        OpenLayers.Request.GET({
            url: serviceUrl + 'wms?request=getCapabilities',
            success: function(req) {
                if(req.status === 200) {

                    var format=new OpenLayers.Format.WMSCapabilities(),
                    doc = format.read(req.responseXML);
                    callback(doc.capability.layers, serviceUrlCache, context);


                } else {
                    context.$el.find('.fetching').addClass("fail")
                        .find(".fetching__message").html("Looks like there something's broken, get notified when we're back up and running");
                }

            },
            failure: function(fail) {
            }
        });
    },

    handleZoom: function(e) {
    },

    clearLayers: function(e) {
        e.preventDefault();

        var overlays = this.getAllOverlays();
        _.each(overlays, function(layerModel){
            layerModel.set("visibility", false);
        });
    },

    accordionize: function(e) {
        e.preventDefault();
        if(!this.$el.find(e.target).parent().hasClass("active")) {
            this.$el.find(e.target).parent().siblings().removeClass("active");
            this.$el.find(e.target).parent().addClass("active");
        } else {
            this.$el.find(e.target).parent().removeClass("active");
        }

        app.Events.Manager.trigger("accordions:closed");
    },

    hideAccordions: function() {
        this.$el.find(".js-accordion").removeClass("active");
        app.Events.Manager.trigger("accordions:closed");
    },

    showMarker: function(mapPoint, content) {
        this.clearMarkers();

        if(content){
            this.hideAccordions();
            var popup = new OpenLayers.Popup.FramedCloud("infoWindow",
                   mapPoint,
                   new OpenLayers.Size(350,250),
                   content,
                   new OpenLayers.Icon("",new OpenLayers.Size(1,1), new OpenLayers.Pixel(0,0)),
                   true);

            popup.maxSize = new OpenLayers.Size(350,250);
            popup.minSize = new OpenLayers.Size(350,250);
            this._popup = popup;
            this._map.addPopup(popup);
        } else {
            var markers = new OpenLayers.Layer.Markers( "Markers" );
            this._map.addLayer(markers);

            var icon = this.model.get("icon");
            markers.addMarker(new OpenLayers.Marker(mapPoint,icon));
        }
    },

    clearMarkers: function() {
        this.clearPopup();
    },

    clearPopup: function() {
        if(this._popup) {
            this._map.removePopup(this._popup);
        }
    },

    alignPanZoom: function() {
        var panZoom = this.$el.find(".olControlPanZoomBar");
        var alignWith = this.$el.find("#mast");

        var margin = alignWith.offset().left + alignWith.width() - 20;
        panZoom.css({"left": margin + "px"});
    },

    resizeHandlers: function() {
        this.alignPanZoom();
    },

    resize: function(e) {
        app.Events.Manager.trigger("window:resize");
    }

});
