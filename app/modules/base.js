(function(B) {

  // required modules - startup, search.
  var ST = ALT.module("startup");
  var S  = ALT.module("search");

  /**
   * The overarching application view manager.
   */
  B.Views.AppView = Backbone.View.extend({
    el : "#main",
    
    initialize: function(attributes) {
      this.el = $(this.el);
    },
    
    render : function() {
      
      // Append search view
      
      var searchView = new S.Views.SearchView();
      searchView.render();
      
      // TODO: Instantiate Main Panel View
      var panelView = new B.Views.PanelsView();
      panelView.render();
      return this;
    }
  });

  /**
   * The main view containing the three info panels.
   */
  B.Views.PanelsView = Backbone.View.extend({
    el : "#panel-container",
    initialize : function(attributes) {
      this.el = $(this.el);
    },

    render : function() {
      // TODO: render 3 panels.
      var startupPanel = new B.Views.Panels.StartupInfo();
      this.el.append(startupPanel.render().el);
    }
  });

  /**
   * A default extension of views for panels.
   */
  B.Views.Panels = Backbone.View.extend({
    initialize: function(attributes) {
      this.el = $(this.id);
    }
  });

  /**
   * A container for metadata about the currently searched tags.
   */
  B.Views.Panels.Metadata = B.Views.Panels.extend({
    id : "#metadata-container"
  });

  /**
   * A container for the startup list that matches the searched tags.
   */
  B.Views.Panels.Startups = B.Views.Panels.extend({
    id : "#startup-list-container"
  });

  /**
   * A container for the metadata about a startup.
   */
  B.Views.Panels.StartupInfo = B.Views.Panels.extend({
    id : "#startup-info-container",

    render : function() {
      var startup = new ST.Models.Startup({ id : 21312 });
      startup.fetch({
        success : _.bind(function(model) {
          console.log(model);
          var fullPanel = new ST.Views.Startup.Full({
            model : model
          }); 

          this.el.html(fullPanel.render().el);
             
        }, this)
      });
      return this;
    }
  });
  
  
})(ALT.module("base"));