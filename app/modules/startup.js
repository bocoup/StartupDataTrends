/**
 * Startup Data Trends
 * Author Irene Ros (Bocoup)
 */
(function(ST, U, B) {

  ST.Models = (ST.Models || {});
  ST.Collections = (ST.Collections || {});

  // Stealing from Backbone... because sync needs it and I'm overwriting it.
  var methodMap = {
    "create": "POST",
    "update": "PUT",
    "delete": "DELETE",
    "read": "GET"
  };

  /**
   * A single representation of a startup.
   */
  ST.Models.Startup = Backbone.Model.extend({
    url: function() {
      return "https://api.angel.co/1/startups/" + this.get("id") +"?callback=?";
    }
  });

  /**
   * A useful little pagination collection extension. Handles two
   * types of collections:
   *   1. Those where the number of pages is discoered on first page
   *   2. Those whose number of pages is known in advance.
   * Used by startup Collection and Trends collection.
   */
  ST.Collections.PaginatedCollection = Backbone.Collection.extend({

    initialize: function(attributes, options) {
      options = (options || {});

      options.page = options.page || 1;
      options.pages = options.pages || 1;
      options.total_pages = options.pages;

      // If fetching total page number from data, what's the attribute
      // name
      options.pages_attribute = options.pages_attribute || null;

      // max number of pages we'll fetch. Null will fetch all.
      options.page_max = options.page_max || null;

      // by default append to collection
      options.append = options.append || true;

      _.extend(this, options);
    },

    clear: function() {

      // remove all models
      this.reset([], { silent: true });

      // reset page counts
      this.page = 1;
      this.pages = 1;
    },

    sync: function(method, model, options) {
      var type = methodMap[method],
          params, extended, fetch, success, i;

      if (this.append) {
        options.add = true;
      }

      // Default JSON-request options.
      params = _.extend({
        type: type,
        dataType: "json"
      }, options);

      // Ensure that we have a URL.
      if (!params.url) {
        params.url = model.url();
      }

      // Ensure that we have the appropriate request data.
      if (!params.data && model && (method === "create" || method === "update")) {
        params.contentType = "application/json";
        params.data = JSON.stringify(model.toJSON());
      }

      // For older servers, emulate JSON by encoding the request into an HTML-form.
      if (Backbone.emulateJSON) {
        params.contentType = "application/x-www-form-urlencoded";
        params.data = params.data ? {model: params.data}: {};
      }

      // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
      // And an `X-HTTP-Method-Override` header.
      if (Backbone.emulateHTTP) {
        if (type === "PUT" || type === "DELETE") {
          if (Backbone.emulateJSON) {
            params.data._method = type;
          }
          params.type = "POST";
          params.beforeSend = function(xhr) {
            xhr.setRequestHeader("X-HTTP-Method-Override", type);
          };
        }
      }

      // Don't process data on a non-GET request.
      if (params.type !== "GET" && !Backbone.emulateJSON) {
        params.processData = false;
      }

      // make first request, then on success, make all subsequent requests
      extended = _.clone(params);
      fetch = function(start, end) {
        for (i = start; i <= end; i++) {
          extended.url = model.url(i);
          extended.success = function(data) {
            model.page += 1;
            if (options.success) {
              options.success(data);
            }

            // if this is the last page, call the done callback if we have one
            if ((model.page - 1) === model.pages && options.done) {
              options.done(model);
            }
          };

          $.ajax(extended);
        }
      };

      // do we know how many pages we are already fetching? If so
      // just make N simultanious requests.
      if (model.pages_attribute === null) {
        fetch(model.page, model.pages);
      } else {
        // we are getting total number of pages from the first call
        // and then going to fetch everything

        success = (function(fetch) {
                  return function(data) {

                    if (model.page === 1) {
                      model.pages = Math.min(model.page_max, data[model.pages_attribute]);
                      model.total_pages = data[model.pages_attribute];
                    }

                    // process first page
                    options.success(data);
                    model.page += 1;

                    // if this is the last page, call the done callback if we have one
                    if ((model.page - 1) === model.pages && options.done) {
                      options.done(model);
                    }

                    fetch(model.page, model.pages);
                  };
                }(fetch));

        params.success = success;
        $.ajax(params);
      }
    }


  });

  /**
   * A collection of startup objects
   */
  ST.Collections.Startups = ST.Collections.PaginatedCollection.extend({
    model: ST.Models.Startup,
    url: function(page) {
      var tags = ALT.app.currentTags.pluck("id").join(",");
      return "http://api.angel.co/1/startups?tag_ids=" + tags +
        "&order=popularity" +
        "&page=" + (page || this.page) +
        "&callback=?";
    },

    parse: function(data) {

      // save total number of startups.
      if (this.page === 1) {
        this.total_startups = data.total;
      }

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

    histogram: function(buckets, attribute) {
      attribute = (attribute || "follower_count");

      // get all numeric values
      var vals = this.pluck(attribute),
          // min = _.min(vals),
          max = _.max(vals),
          // compute step
          step = Math.ceil(max / buckets),
          // bins
          bins = [],
          bin = 0,i;
          // range = [min, min + step],
          // val,

      for (i = 0; i < vals.length; i++) {
        bin = Math.floor(vals[i]/step);
        bins[bin] = (bins[bin] || 0);
        bins[bin]++;
      }

      // swap undefined with 0s
      for (i = 0; i < bins.length; i++) {
        if (bins[i] == null) {
          bins[i] = 0;
        }
      }

      return bins;
    },

    markets: function() {
      var tags = ALT.app.currentTags.pluck("id");

      return U.frequencyCount(
        _.flatten(
          _.select(this.pluck("markets"), function(tag) {
            return tags.indexOf(tag.id) === -1;
          })
        ),
      "display_name", "id");
    }
  });

  ST.Trend = Backbone.Model.extend({

    decayScore: function() {
      var sum = 0,
          arr = this.get("timeseries"),
          mean = U.Stats(arr).mean,
          i = 0;

      for (; i < arr.length; i++) {
        sum += (arr[i] - (U.Stats(arr.slice(0,i)).mean || 0)) * Math.pow(1, -i/mean);
      }
      return sum || 0;
    }
  });

  ST.Trends = ST.Collections.PaginatedCollection.extend({
    model: ST.Trend,

    url: function(page) {
      // based on the page, get a subset of ids to request.
      var id_subset = this.ids.slice((page - 1) * this.per_page, page * this.per_page);
      return "http://api.angel.co/1/follows/trends?startup_ids=" + id_subset.join(",") + "&callback=?";
    },
    parse: function(data) {
      this.dates = data.dates;
      var trends = [];
      _.each(data.trends, function(value, key) {
        trends.push({
          id: key,
          timeseries: value
        });
      });
      return trends;
    }
  });

  /**
   * A startup info panel, showing full data.
   */
  ST.Views.Full = Backbone.View.extend({
    template: "panel-startup-full",

    initialize: function(attributes, options) {
      // Get compile template from cache
      this.template = ALT.app.templates[this.template];
      this.el = $(this.el);

      this.model.bind("change", this.render, this);
    },

    render: function() {
      this.el.html(this.template({ startup: this.model.toJSON() }));

      // make tabs
      this.$("#tabs").tabs();

      // render screenshots
      this.$("a.screenshot").colorbox({
        "rel": "screenshots",
        "maxWidth": "960px",
        "maxHeight": "800px"
      });
      return this;
    }
  });

  /**
   * A single startup in the list of startups
   */
  ST.Views.Mini = Backbone.View.extend({
    template: "panel-startup-list-item",
    className: "startup-list-item",
    tagName: "li",
    events: {
      "click": "onClick"
    },

    initialize: function(attributes, options) {
      // Get compile template from cache
      this.template = ALT.app.templates[this.template];
    },

    render: function() {
      $(this.el).append(this.template({ startup: this.model.toJSON()}));
      return this;
    },

    assignHeight: function(height) {

      // this is a separate method because this needs to happen AFTER
      // the item has been appended to a parent.
      this.height = height || $(this.el).height();
      $(this.el).css({
        "height": this.height,
        "display": "block",
        "position": "relative"
      });

      this.top = $(this.el).position().top;
    },

    onClick: function(e) {
      // On click, we need to rerender the main panel. This will
      // happen because when the currentStartup model changes,
      // that render method will be called.
      if (!ALT.app.currentStartup) {
        ALT.app.currentStartup = new ST.Models.Startup();
      }
      ALT.app.currentStartup.clear({ silent: true });
      ALT.app.currentStartup.set(this.model.toJSON(), { silent: true });
      ALT.app.currentStartup.fetch({
        success: function(model) {
          model.change();
        }
      });
    }
  });

  /**
   * A view of the startup list.
   */
  ST.Views.List = Backbone.View.extend({

    id: "#startup-list-container",
    template: "panel-startup-list",

    initialize: function(attributes) {

      this.el = $(this.id);

      // Get compile template from cache
      this.template = ALT.app.templates[this.template];

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
          success : _.bind(function(collection) {

            // If there are no startups, exit gracefully
            if (!collection.length) {
              collection.trigger("done");
              return B.Views.Done();
            }

            if (collection.page === 1) {
              // We are cloning the model instead of just referencing it
              // because the full startup panel is tied to this one
              // model and we are going to reset it with the proper
              // model on click (so we don't want to overwrite the first
              // model in the actual startup list collection.)
              collection.trigger("start");
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

    bindAdd: function(model) {

      // create a new startup item and append it.
      var startupListItem = new ST.Views.Mini({ model: model });
      this._startupListItems[model.id] = startupListItem;
      this.$("ul.startup-list").append(startupListItem.render().el);
    },

    bindResort: function(by) {

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
    onClickStartup: function(event) {
      if (this.clickedStartup) {
        this.clickedStartup.removeClass("selected");
      }
      this.clickedStartup = $(event.currentTarget);
      this.clickedStartup.addClass("selected");
    },

    /**
     * Cleans up the view and unbinds all events to the collection
     */
    cleanup: function() {

      // reset to clean slate
      this.render();

      // unbind all events!
      this.collection.unbind("reset", this.update);
      this.collection.unbind("add", this.bindAdd);
      this.collection.unbind("done", this.finish);
      this.collection.unbind("alt.resort", this.bindResort);
    },

    /**
     * Reanimates the list sort order
     */
    update: function(subset) {

      var models = subset || this.collection.models,
          pos = 0;

      this.collection.each(function(startup, i, collection) {

        var listItem = this._startupListItems[startup.id],
            $listItem = $(listItem.el),
            from, to;

        if (models.indexOf(startup) === -1) {

          // if startup is not in the subset, hide its element.
          $listItem.hide();

        } else {
          // show the element since we might have hidden it in a previous
          // situation (like slider movement)
          $listItem.show();

          // reposition it.
          from = listItem.top;
          to = listItem.height * pos;

          if (collection.length < 100) {
            $listItem.css({
              position: "absolute",
              top: from
            }).animate({
              top: to
            }, 500, function() {
              // save the top so that we can animate from it in the future
              // if it's hidden.
              listItem.top = to;
            });
          } else {
            $listItem.css({
              position: "absolute",
              top: to
            });
          }
          pos++;
        }
      }, this);
    },

    render: function() {

      // Render initial list, empty.
      this.el.html(this.template());
    },

    getTrends: function() {
      var ids = this.collection.pluck("id");

      this.trends = new ST.Trends([], {
        ids: ids,
        per_page: 50,
        pages: Math.ceil(ids.length / 50)
      });

      this.trends.fetch({
        done: _.bind(function(collection) {
          collection.each(function(trend) {

            // find the list view item for it
            var startupListViewItem = this._startupListItems[trend.id],
                $trend = startupListViewItem.$(".follower_count_trend");

            $trend.sparkline(
              trend.get("timeseries"),
              {
                lineColor: "#222",
                fillColor: false
              }
            );

            $trend.attr({
              title: "Decay Score: " + trend.decayScore().toPrecision(2)
            });

          }, this);
        }, this)
      });
    },

    finish: function() {

      // added loaded classname
      this.$(".startup-list-container").addClass("loaded");

      // Render startup info panel
      // it takes care of its own rendering and startup
      // extended info fetching.
      if (this.collection.length) {
        ALT.app.currentStartup = this.collection.at(0).clone();
        ALT.app.startupPanel = new B.Views.Panels.StartupInfo({
          model: ALT.app.currentStartup
        });
      } else {
        if (ALT.app.startupPanel) {
          ALT.app.startupPanel.renderEmpty();
        }
      }

      this.assignHeights();

      //  get time series data
      this.getTrends();

      // remove the more button if we're all out of pages
      if (this.collection.pages === this.collection.total_pages) {
        this.$("#load-more-startups").hide();
      }

      // Bind select change.
      // we have to wait until all items are loaded.
      // TODO look into binding to the ul instead!
      this.delegateEvents({
        "click li.startup-list-item": "onClickStartup"
      });

    },

    assignHeights: function() {

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

    hideCounts: function(type) {
      this.$(".counts").hide();

      if (type === "followers_over_time") {
        type = "follower_count";
      }

      this.$(".counts." + type).show();
    }

  });

})(ALT.module("startup"), ALT.module("utils"), ALT.module("base"));