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

      // Render metadata panel
      // Render startup list
      // TODO: remove this canned startup list here.
      var startups = new ST.Collections.Startups();
      startups.fetch({
        success : _.bind(function(collection) {
          var startupList = new B.Views.Panels.Startups({ collection : collection });    
          startupList.render();
          ALT.startuplist = collection;
        }, this)
      });
      

      // Render startup info panel
      var startupPanel = new B.Views.Panels.StartupInfo();
      this.el.append(startupPanel.render().el);

      return this;
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
    id : "#startup-list-container",
    template : "#panel-startup-list",
    initialize : function(attributes) {
      this.el = $(this.id);
      this.template = _.template($(this.template).html());

      // when the collection resorts, animate the transition.
      this.collection.bind("reset", this.update, this);
    },

    update : function() {
      this.collection.each(function(startup, i) {

        var listItem = this._startupListItems[startup.id];
        var from = listItem.top;
        var to   = listItem.height * i;
        $(listItem.el).css({
          "position": "absolute",
          "top" : from}).animate({
            "top": to
          }, 500);
      }, this);
    },

    render : function() {
      this.el.append(this.template());

      this._startupListItems = {};
      
      // create a list item for each startup
      this.collection.each(_.bind(
        function(startup) {
          var startupListItem = new ST.Views.Mini({ model : startup });
          this._startupListItems[startup.id] = startupListItem;
          this.$('ul.startup-list').append(startupListItem.render().el);
          startupListItem.assignHeight();
        }, this)    
      );
    }
  });

  /**
   * A container for the metadata about a startup.
   */
  B.Views.Panels.StartupInfo = B.Views.Panels.extend({
    id : "#startup-info-container",

    render : function() {
      ALT.app.currentStartup = new ST.Models.Startup({ id : 21312 });
      ALT.app.currentStartup.fetch({
        success : _.bind(function(model) {
          var fullPanel = new ST.Views.Full({
            model : model
          }); 

          this.el.html(fullPanel.render().el);
             
        }, this)
      });
      return this;
    }
  });
  
  
})(ALT.module("base"));