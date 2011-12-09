(function(B) {

  // required modules - startup, search.
  var ST = ALT.module("startup");
  var S  = ALT.module("search");

  B.Views.Progressify = function() {
    $('#loader').show();
  };

  B.Views.Done = function() {
    $('#loader').hide();
  }

  /**
   * The overarching application view manager.
   */
  B.Views.AppView = Backbone.View.extend({
    el : "#main",
    
    initialize: function(attributes) {
      this.el = $(this.el);
    },
    
    render : function() {
      
      // create the search view
      this.searchView = new S.Views.SearchView();
      this.searchView.render();
      
      // create the three panel view
      this.panelView = new B.Views.PanelsView();
      this.panelView.render();

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
      var tags = ALT.app.currentTags.pluck("id").join(","); 
      ALT.app.startupCollection = new ST.Collections.Startups({}, { 
        tags : tags
      });

      if (tags.length) {
        B.Views.Progressify();
        ALT.app.startupCollection.fetch({
          success : _.bind(function(collection) {
            
            var startupList = new B.Views.Panels.Startups({ 
              collection : collection 
            });    
            
            startupList.render();

            ALT.app.currentStartup = collection.at(0);

            // Render startup info panel
            var startupPanel = new B.Views.Panels.StartupInfo({
              model : ALT.app.currentStartup
            });

            this.el.append(startupPanel.render().el);
            B.Views.Done();
          }, this)
        });
      }

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

    onSelect : function(event) {

      this.collection.comparator = function(model) {
        if (event.target.value === "follower_count") {
          return -model.get(event.target.value);  
        } else {
          return model.get(event.target.value).toLowerCase();
        }
        
      }
      this.collection.sort();
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
      this.el.html(this.template());
      this.delegateEvents({
        "change select" : "onSelect"
      });

      this._startupListItems = {};
      
      // create a list item for each startup
      this.collection.each(_.bind(
        function(startup) {
          var startupListItem = new ST.Views.Mini({ model : startup });
          this._startupListItems[startup.id] = startupListItem;
          this.$('ul.startup-list').append(startupListItem.render().el);
        }, this)    
      );

      // find the maxHeight of list element
      var maxHeight = Math.max.apply(null, 
        $(".startup-list-item").map(function (){
          return $(this).height();
        }).get());
      
      // Set the height of all list elements to the max. This
      // is required for happy sorting.
      _.each(this._startupListItems, function(view) {
        view.assignHeight(maxHeight);
      });

    }
  });

  /**
   * A container for the metadata about a startup.
   */
  B.Views.Panels.StartupInfo = B.Views.Panels.extend({
    id : "#startup-info-container",

    render : function() {

      B.Views.Progressify();
      if (this.model) {
        this.model.fetch({
          success : _.bind(function(model) {
            
            var fullPanel = new ST.Views.Full({
              model : model
            }); 

            this.el.html(fullPanel.render().el);
            B.Views.Done();       
          }, this)
        });
      } else {
        B.Views.Done();
        this.el.html("<h3> No Startups Found </h3>");
      }
      return this;
    }
  });
  
  
})(ALT.module("base"));