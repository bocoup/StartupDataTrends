(function(B) {
  
  /**
   * The overarching application view manager.
   */
  B.Views.AppView = Backbone.View.extend({
    el : '#main',
    
    initialize: function(attributes) {
      this.el = $(this.el);
    },
    
    render : function() {
      
      // Append search view
      var S = ALT.module("search");
      var searchView = new S.Views.SearchView();
      this.el.append(searchView.render().el);
      
      // TODO: Instantiate Main Panel View
      
      return this;
    }
  });
  
  
})(ALT.module("base"));