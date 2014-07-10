var app = app || {};

app.Collection.LayerGroupCollection = Backbone.Collection.extend({
    model: app.Model.LayerGroup,
    comparator: function( collection ){
			return( collection.get( 'title' ) );
		}
});
