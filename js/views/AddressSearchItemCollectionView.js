var app = app || {};

app.View.AddressSearchItemCollectionView = Backbone.View.extend({
    el: "#addressResults",

    initialize: function(addresses) {

        this.collection = new app.Collection.AddressSearchItemCollection(addresses);

        // listen for reset events and render the collection
        this.collection.on('reset', this.render, this);
        app.Events.Manager.on("addressView:addressClicked addressView:addressError", this.toggleView, this);

        this.render();
    },

    render: function() {
        this.$el.html("");
        this.collection.each(function(address) {
            this.renderAddress(address);
        }, this);

        if(this.collection.length > 0) {
            this.toggleView(true);
        } else {
            this.toggleView(false);
        }

        return this;
    },

    renderAddress: function(addressItem) {
        var addressView = new app.View.AddressView({
            model: addressItem
        });
        this.$el.append(addressView.render().el);
    },

    toggleView: function(show) {
        if(show) {
            this.$el.addClass("active");
        } else {
            this.$el.removeClass("active");
        }
    }



});