var app = app || {};

app.View.StatisticView = Backbone.View.extend({
    model: app.Model.Statistic,
    el: "#distance",
    tagName: 'li',
    className: 'stat',
    template: $("#statTemplate").html(),

    events: {
        "click .js-close": "stopMeasuring"
    },

    initialize: function(model) {
        this.model = new app.Model.Statistic(model);

        app.Events.Manager.on("measuring:active", this.toggleView, this);

        this.render();
    },

    render: function() {
        var templ = _.template(this.template);
        this.$el.html(templ(this.model.toJSON()));
        return this;
    },

    updateStat: function(opts) {
        if (opts.value) {
            this.model.set("value", opts.value);
        }
        if (opts.unit !== undefined) {
            this.model.set("unit", opts.unit);
        }
        if (opts.sup !== undefined) {
            this.model.set("sup", opts.sup);
        }
        if (opts.title !== undefined) {
            this.model.set("title", opts.title);
        }
        this.render();
    },

    toggleView: function(active, measurement) {

        if(active) {
            this.$el.addClass("active");
            this.model.set("title", measurement);
        } else {
            this.$el.removeClass("active");
        }

        this.render();
    },

    stopMeasuring: function(e) {
        e.preventDefault();
        app.Events.Manager.trigger("accordions:closed");
        this.toggleView(false);
    }

});