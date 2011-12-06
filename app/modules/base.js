(function(Base) {
  
  /**
   * The overarching application view manager.
   */
  Base.Views.AppView = Backbone.View.extend({
    el : '#main',
    
    initialize: function(attributes) {
      this.el = $(this.el);
    },
    
    render : function() {
      
      // Append search view
      var searchView = new Base.Views.SearchView();
      this.el.append(searchView.render().el);
      
      // TODO: Instantiate Main Panel View
      
      return this;
    }
  });
  
  
})(ALT.module("base"));