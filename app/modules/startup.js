(function(ST, U) {

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
      this.tags = options.tags;
      this.page = 1;
      this.pages = 1;
    },
    url : function(page) {
      // TODO: rewrite this eventually to use our collected search tags
      // for now just return a canned list.
      // return "https://api.angel.co/1/search?query=jobs&type=Startup&callback=?" 
      return "http://api.angel.co/1/startups?tag_ids=" + this.tags + 
        "&order=popularity" +
        "&page=" + (page || this.page) +
        "&callback=?"
    },
    parse : function(data) {
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
      return U.frequencyCount(
        _.flatten(
          this.pluck("markets")
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

   var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read'  : 'GET'
  };

})(ALT.module("startup"), ALT.module("utils"));