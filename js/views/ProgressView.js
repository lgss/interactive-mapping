var app = app || {};

app.View.ProgressBar = Backbone.View.extend({
    el: "#pro",
    template: $("#progressBarTemplate").html(),

    initialize: function(obj) {
        this.model = new app.Model.Progress(obj);

        this.model.on("change:current", this.updateProgress, this);
        this.on("progress:complete", this.log, this);

        this.render();
    },

    render: function() {

        //parse the template
        var templ = _.template(this.template);

        // set this elements html to the model rendered in the template
        this.$el.html(templ(this.model.toJSON()));

        return this;
    },

    updateProgress: function() {
        if (this.model.get("current") === this.model.get("total")) {
            this.trigger('progress:complete');
            //this.$el.fadeOut();
        }
        this.render();
    },

    log: function() {
    }
});