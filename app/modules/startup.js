(function(ST, U, B) {

  ST.Models || (ST.Models = {});
  ST.Collections || (ST.Collections = {});

  /**
   * A single representation of a startup.
   */
  ST.Models.Startup = Backbone.Model.extend({
    url : function() {
      return "https://api.angel.co/1/startups/" + this.get("id") +"?callback=?";
    }
  });

  /** 
   * A collection of startup objects
   */
  ST.Collections.Startups = Backbone.Collection.extend({
    model : ST.Models.Startup,
    initialize : function(attributes, options) {
      this.page = 1;
      this.pages = 1;
    },
    url : function(page) {

      var tags = ALT.app.currentTags.pluck("id").join(",");

      return "http://api.angel.co/1/startups?tag_ids=" + tags + 
        "&order=popularity" +
        "&page=" + (page || this.page) +
        "&callback=?"
    },
    
    clear : function() {

      // remove all models
      this.reset([], { silent : true });

      // reset page counts
      this.page = 1;
      this.pages = 1;
      
    },

    parse : function(data) {
      // Only show visible startups. Hidden ones have no actual
      // data.
      var visible_data = _.select(data.startups, function(startup) {
        return startup.hidden === false;
      });

      // cache screenshot count
      _.each(visible_data, function(startup) {
        startup.screenshot_count = startup.screenshots.length;
      });

      return visible_data;
    },

    histogram : function(buckets, attribute) {
      attribute || (attribute = "follower_count");
      

      // get all numeric values
      var vals = this.pluck(attribute),
          min = _.min(vals),
          max = _.max(vals);

      // compute step
      var step = Math.ceil(max / buckets);

      // bins
      var bins = [], bin = 0, range = [min, min + step], val;
      for (var i = 0; i < vals.length; i++) {
        bin = Math.floor(vals[i]/step);
        bins[bin] || (bins[bin] = 0);
        bins[bin]++;
      }

      // swap undefined with 0s
      for (var i = 0; i < bins.length; i++) {
        if (typeof bins[i] === "undefined") {
          bins[i] = 0;
        }
      }

      return bins;
    },

    markets : function() {
      var tags = ALT.app.currentTags.pluck("id");

      return U.frequencyCount(
        _.flatten(
          _.select(this.pluck("markets"), function(tag) {
            return tags.indexOf(tag.id) === -1;
          })
        ), 
      "display_name", "id");
    },

    sync : function(method, model, options) {
      var type = methodMap[method];

      // Default JSON-request options.
      var params = _.extend({
        type:         type,
        dataType:     'json'
      }, options);

      // Ensure that we have a URL.
      if (!params.url) {
        params.url = model.url();
      }

      // Ensure that we have the appropriate request data.
      if (!params.data && model && (method == 'create' || method == 'update')) {
        params.contentType = 'application/json';
        params.data = JSON.stringify(model.toJSON());
      }

      // For older servers, emulate JSON by encoding the request into an HTML-form.
      if (Backbone.emulateJSON) {
        params.contentType = 'application/x-www-form-urlencoded';
        params.data        = params.data ? {model : params.data} : {};
      }

      // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
      // And an `X-HTTP-Method-Override` header.
      if (Backbone.emulateHTTP) {
        if (type === 'PUT' || type === 'DELETE') {
          if (Backbone.emulateJSON) params.data._method = type;
          params.type = 'POST';
          params.beforeSend = function(xhr) {
            xhr.setRequestHeader('X-HTTP-Method-Override', type);
          };
        }
      }

      // Don't process data on a non-GET request.
      if (params.type !== 'GET' && !Backbone.emulateJSON) {
        params.processData = false;
      }

      // make first request, then on success, make all subsequent requests
      var page_params = _.clone(params);
      var success = function(data) {
          
        // register number of pages - max 20.
        if (model.page === 1) {
          model.pages = Math.min(10, data.last_page);
          model.total_pages = data.last_page;
          model.total_startups = data.total;
        }
        
        // process first page
        options.success(data);

        model.page += 1;
  
        for(var i = model.page; i <= model.pages; i++) {
          page_params.url = model.url(i);
          page_params.success = function(data) {
            model.page += 1;
            options.success(data)
          }
          $.ajax(page_params);
        } 
      }

      params.success = success;
      $.ajax(params);
    }
  });

  ST.Trend = Backbone.Model.extend({
    
    decayScore : function() {
      var sum = 0,
          arr = this.get("timeseries"),
          mean = U.Stats(arr).mean;
      for (var i = 0; i < arr.length; i++) {
        sum += (arr[i] - (U.Stats(arr.slice(0,i)).mean || 0)) * Math.pow(1, -i/mean);
      }
      return sum || 0;
    }
  });
  
  ST.Trends = Backbone.Collection.extend({
    model : ST.Trend,
    initialize : function(attributes, options) {
      this.ids = options.ids;
    },
    url : function() {
      return "http://api.angel.co/1/follows/trends?startup_ids=" + this.ids.join(",") + "&callback=?";
    },
    parse : function(data) {
      this.dates = data.dates;
      var trends = [];
      _.each(data.trends, function(value, key) {
        trends.push({
          id : key,
          timeseries : value
        });
      });
      return trends;
    }
  });

  /**
   * A startup info panel, showing full data.
   */
  ST.Views.Full = Backbone.View.extend({
    template : "#panel-startup-full",

    initialize: function(attributes, options) {
      this.template = _.template($(this.template).html());
      this.el = $(this.el);

      this.model.bind("change", this.render, this);
    },

    render : function() {
      this.el.html(this.template({ startup : this.model.toJSON() }));

      // make tabs
      this.$("#tabs").tabs();

      // render screenshots
      this.$('a.screenshot').colorbox({ 
        'rel' : 'screenshots',
        'maxWidth' : "960px",
        'maxHeight': "800px"
      });
      return this;
    }
  });

  /** 
   * A single startup in the list of startups
   */
  ST.Views.Mini = Backbone.View.extend({
    template : "#panel-startup-list-item",
    className : "startup-list-item",
    tagName : "li",
    events : {
      "click" : "onClick"
    },

    initialize : function(attributes, options) {
      this.template = _.template($(this.template).html());
    },

    render : function() {
      $(this.el).append(this.template({ startup : this.model.toJSON()}));
      return this;
    },

    assignHeight : function(height) {
      
      // this is a separate method because this needs to happen AFTER
      // the item has been appended to a parent.
      this.height = height || $(this.el).height();
      $(this.el).css({
        "height" : this.height,
        "display" : "block",
        "position" : "relative"
      });

      this.top = $(this.el).position().top;
    },

    onClick : function(e) {
      // On click, we need to rerender the main panel. This will
      // happen because when the currentStartup model changes,
      // that render method will be called.
      if (!ALT.app.currentStartup) {
        ALT.app.currentStartup = new ST.Models.Startup();
      }
      ALT.app.currentStartup.clear({ silent : true });
      ALT.app.currentStartup.set(this.model.toJSON(), { silent : true });
      ALT.app.currentStartup.fetch({
        success : function(model) {
          model.change();
        }
      });
    }
  });

  /** 
   * A view of the startup list.
   */
  ST.Views.List = Backbone.View.extend({

    id : "#startup-list-container",
    template : "#panel-startup-list",
    
    initialize : function(attributes) {
      
      this.el = $(this.id);
      this.template = _.template($(this.template).html());

      // save incoming tags.
      this.tags = attributes.tags;

      // Create cache for startup list items
      this._startupListItems = {};

      // base render, just container
      this.render();

      // if there are any tags, start the list fetching!
      if (this.tags.length) {
        
        // TODO REPLACE THIS WITH A UTIL THING
        B.Views.Progressify();

        this.collection.fetch({
          add : true,
          success : _.bind(function(collection) {
            
            if (collection.page === 1) {
              // We are cloning the model instead of just referencing it
              // because the full startup panel is tied to this one
              // model and we are going to reset it with the proper
              // model on click (so we don't want to overwrite the first
              // model in the actual startup list collection.)
              collection.trigger("start");
              
              ALT.app.currentStartup = collection.at(0).clone();

              // Render startup info panel
              // it takes care of its own rendering and startup
              // extended info fetching.
              var startupPanel = new B.Views.Panels.StartupInfo({
                model : ALT.app.currentStartup
              });
            }

            // trigger that another page was fetched of the collection
            collection.trigger("page");

            // When all things are rendered, trigger that we are
            // done fetching all pages.
            if (collection.page === collection.pages+1 ||
                collection.pages === 1) {
              
              collection.trigger("done");
              B.Views.Done();
            }

          }, this)
        });
      }


      // ---- BIND EVENTS -----

      // When a new item is added to the collection, append another
      // list item to it.
      this.collection.bind("add", this.bindAdd, this);

      // bind on a resorting of the list operation (from select on metadata panel)
      this.collection.bind("alt.resort", this.bindResort, this);
            
      // when the collection resorts, animate the transition.
      this.collection.bind("reset", this.update, this);

      // When the collection is done loading the last page, finish
      // whatever rendering we needed to.
      this.collection.bind("done", this.finish, this);

    },

    bindAdd : function(model) {
      
      // create a new startup item and append it.
      var startupListItem = new ST.Views.Mini({ model : model });
      this._startupListItems[model.id] = startupListItem;
      this.$('ul.startup-list').append(startupListItem.render().el);
    },

    bindResort : function(by) {
      
      // redefine collection comparator.
      this.collection.comparator = _.bind(function(model) {
        if (by === "follower_count" || by === "screenshot_count") {
          return -model.get(by);
        } else if (by === "followers_over_time") {
          return -this.trends.get(model.id).decayScore();   
        } else {
          return model.get(by).toLowerCase();
        }
      }, this);

      // Resort the collection.
      this.collection.sort();

    },
    
    /**
     * Startup list item click selection
     */
    onClickStartup : function(event) {
      if (this.clickedStartup) {
        this.clickedStartup.removeClass("selected");
      }
      this.clickedStartup = $(event.currentTarget);  
      this.clickedStartup.addClass("selected");
    },

    /**
     * Cleans up the view and unbinds all events to the collection
     */
    cleanup : function() {
      
      // reset to clean slate
      this.render();
      
      console.log("unbinding")
      
      // unbind all events!
      this.collection.unbind("reset", this.update);
      this.collection.unbind("add", this.bindAdd);
      this.collection.unbind("done", this.finish);
      this.collection.unbind("alt.resort", this.bindResort);
    },

    /**
     * Reanimates the list sort order
     */
    update : function(subset) {

      var models = subset || this.collection.models;
      var pos = 0;
      console.log("STARTING SORT");
      this.collection.each(function(startup, i, collection) {

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
          if (collection.length < 100) {
            $(listItem.el).css({
              "position": "absolute",
              "top" : from}).animate({
                "top": to
              }, 500, function() {
                // save the top so that we can animate from it in the future
                // if it's hidden.
                listItem.top = to;
              });
          } else {
            $(listItem.el).css({
              "position": "absolute",
              "top" : to});
          }
          pos++;
        }
      }, this);    
    },

    render: function() {
      
      // Render initial list, empty.
      this.el.html(this.template());
    },

    getTrends : function() {
      var ids = this.collection.pluck("id");
      this.trends = new ST.Trends([], { ids : ids });
      this.trends.fetch({
        success : _.bind(function(collection) {
          collection.each(function(trend) {
            
            // find the list view item for it
            var startupListViewItem = this._startupListItems[trend.id];

            startupListViewItem.$('.follower_count_trend').sparkline(
              trend.get("timeseries"),
              {
                lineColor: "#222",
                fillColor: false
              }
            );

            startupListViewItem.$('.follower_count_trend').attr({
              "title" : "Decay Score: " + trend.decayScore().toPrecision(2)
            });

          }, this)
        }, this)
      });

    },

    finish : function() {

      // added loaded classname
      this.$('.startup-list-container').addClass("loaded");

      this.assignHeights();

      //  get time series data
      this.getTrends();

      // remove the more button if we're all out of pages
      if (this.collection.pages === this.collection.total_pages) {
        this.$('#load-more-startups').hide();
      }

      // Bind select change.
      // we have to wait until all items are loaded.
      // TODO look into binding to the ul instead!
      this.delegateEvents({
        "click li.startup-list-item" : "onClickStartup"
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
    },

    hideCounts : function(type) {
      this.$('.counts').hide();
      
      if (type === "followers_over_time") {
        type = "follower_count";
      }

      this.$('.counts.' + type).show();
    }

  });

   var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read'  : 'GET'
  };

})(ALT.module("startup"), ALT.module("utils"), ALT.module("base"));