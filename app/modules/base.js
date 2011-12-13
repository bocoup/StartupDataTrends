(function(B) {

  // required modules - startup, search.
  var ST = ALT.module("startup");
  var S  = ALT.module("search");

  (function() {
    
    // Progress viewers are tied to a count. Only when
    // all operations are done will the progress indicator
    // actually be removed.    
    var loadingViews = 0;
    B.Views.Progressify = function() {
      loadingViews += 1;
      $('#loader').show();
    };
    B.Views.Done = function() {
      if (loadingViews === 1) {
        $('#loader').hide();
      }
      loadingViews -= 1;
    };
  })();

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
     
      ALT.app.startupCollection = new ST.Collections.Startups([], { 
        tags : tags
      });

      // Create a new startup list collection view
      var startupList = new B.Views.Panels.Startups({ 
        collection : ALT.app.startupCollection
      });

      if (tags.length) {
        B.Views.Progressify();
        
        ALT.app.startupCollection.fetch({ 
          add : true,

          // on the first page, render a side panel
          success : _.bind(function(collection) {
            
            if (collection.page === 1) {
              // We are cloning the model instead of just referencing it
              // because the full startup panel is tied to this one
              // model and we are going to reset it with the proper
              // model on click (so we don't want to overwrite the first
              // model in the actual startup list collection.)
              ALT.app.currentStartup = collection.at(0).clone();

              // Render startup info panel
              var startupPanel = new B.Views.Panels.StartupInfo({
                model : ALT.app.currentStartup
              });

              this.el.append(startupPanel.render().el);
            }

            // When all things are rendered, adjust the heights
            if (collection.page === collection.pages+1 ||
                collection.pages === 1) {
              startupList.finish();
              B.Views.Done();
            }
          }, this)
        });
        
        ALT.app.startupCollection.bind("add", function(model, collection) {
          startupList.append(model);
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

      // Create cache for startup list items
      this._startupListItems = {};

      this.render();
    },

    onSelect : function(event) {

      this.collection.comparator = function(model) {
        if (event.target.value === "follower_count") {
          return -model.get(event.target.value);  
        } else {
          return model.get(event.target.value).toLowerCase();
        }s
        
      }
      this.collection.sort();
    },

    update : function(subset) {

      var models = subset || this.collection.models;
      var pos = 0;
      this.collection.each(function(startup, i) {

        var listItem = this._startupListItems[startup.id];
        if (models.indexOf(startup) === -1) {
        
          // if startup is not in the subset, hide its element.
          $(listItem.el).hide();
        
        } else {
          // show the element since we might have hidden it in a previous
          // situation (like slider movement)
          $(listItem.el).show();

          // reposition it.
          var from = listItem.top;
          var to   = listItem.height * pos;
          $(listItem.el).css({
            "position": "absolute",
            "top" : from}).animate({
              "top": to
            }, 500, function() {
              listItem.top = to;
            });
          
          pos++;
        }
      }, this);    
    },

    render: function() {
      // Render initial list
      this.el.html(this.template());

      // disable the sorting until we're done loading everything
      this.$('select').attr('disabled', 'disabled');
    },

    append : function(startup) {
      var startupListItem = new ST.Views.Mini({ model : startup });
      this._startupListItems[startup.id] = startupListItem;
      this.$('ul.startup-list').append(startupListItem.render().el);
    },

    finish : function() {

      // make a range slider
      $('#range').show();
      var vals = this.collection.pluck("follower_count"),
          min = _.min(vals),
          max = _.max(vals);
      $('#slider-range').slider({
        range : true,
        min : min,
        max : max,
        values : [min, max],
        step: 10,
        slide : function(event, ui) {
          $('#slider-range-left').html(ui.values[0]);
          $('#slider-range-right').html(ui.values[1]);
        },
        stop: _.bind(
            function(event, ui) {
              // find all startups who's follower counts are between ranges.
              var subset = this.collection.select(function(startup) {
                return (startup.get("follower_count") >= ui.values[0] &&
                        startup.get("follower_count") <= ui.values[1]);
              });

              // update the layout with subset
              this.update(subset);
          }, this)
      });
      $('#slider-range-left').html(min);
      $('#slider-range-right').html(max);

      // make a sparkline
      $('.slider-sparkline').sparkline(
        this.collection.histogram(30),
        {
          type : "bar",
          width : "100%",
          barColor: "orange",
          lineColor: "none"
        });
      $('.slider-sparkline canvas').css({ width: "100%" });

      this.assignHeights();

      // enable select
      this.$('select').removeAttr('disabled');

      // Bind select change.
      this.delegateEvents({
        "change select" : "onSelect"
      });
    },

    assignHeights : function() {

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