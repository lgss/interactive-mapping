var app = app || {};

app.View.AddressSearchView = Backbone.View.extend({
    el: "#addressSearch",
    model: app.Model.AddressSearch,
    template: $("#addressSearchTemplate").html(),

    events: {
        'click input[type="submit"]': "setValue",
        'keydown input[type="text"]': "handleKeyPress"
    },

    initialize: function() {

        // create the address search model/view
        this.model = new app.Model.AddressSearch();

        // set a listener for changes to the value of the address search
        this.listenTo(this.model, "change:value", this.query);
        this.listenTo(this.model, "change:results", this.render);

        // render the view
        this.render();
    },

    render: function() {
        //parse the template
        var templ = _.template(this.template);

        // set this elements html to the model rendered in the template
        this.$el.html(templ(this.model.toJSON()));

        return this;
    },

    setValue: function(e) {
        e.preventDefault();

        // if the value of the text is greater than 3, update the value in the model
        var searchTerm = this.$el.find(".js__address-search-input").val();

        if(searchTerm.length >= 6) {
            this.model.set("value",searchTerm);

            if(this.model.get("value") === this.model.previousAttributes().value) {
                this.model.trigger("change:value");
            }
        }
    },

    query: function() {
        this.getPostCodeResults(this.model.get("value"));
    },

    /**
     * Gets the address search results for a given address string
     * @param  {String} addressStr [a full or partial address string]
     * @return {[Array]} [an array of address results objects]
     */
    getPostCodeResults: function(addressStr) {
        var self = this;
        $.ajax({
                url: "http://selfserve.northampton.gov.uk/mycouncil-test/PropertySearch?q="+addressStr+"&callback=?",
                dataType: "jsonp",
                beforeSend: function() {
                    self.$el.find('input[type="submit"]').addClass("active");
                },
                complete: function() {
                    self.$el.find('input[type="submit"]').removeClass("active");
                },
                success: function(data) {
                    if(data.success) {
                        self.results = new app.View.AddressSearchItemCollectionView(data.results);
                        //app.Events.Manager.trigger("addressSearch:postcode:success", data.results);
                    }
                },
                error: function() {
                    self.results = new app.View.AddressSearchItemCollectionView([{
                        name: "",
                        number: "",
                        number_and_street: "Sorry, we didn't find any results."
                    }]);

                    setTimeout(function(){
                        self.trigger("addressView:addressError",false);
                    },2000);
                }
        });
        /*var search = new OpenSpace.Postcode();
        search.getLonLat(addressStr,function(results){
            app.Events.Manager.trigger("addressSearch:postcode:success", results);
        });*/
    },

    handleKeyPress : function(e) {
        // stop the map moving on key press
        e.stopPropagation();
    }
});
