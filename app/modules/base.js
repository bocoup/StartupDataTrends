/**
 * Startup Data Trends
 * Author Irene Ros (Bocoup)
 */
(function(B) {

  // required modules - startup, search.
  var ST = ALT.module("startup"),
      S  = ALT.module("search"),
      U  = ALT.module("utils"),

      // Progress viewers are tied to a count. Only when
      // all operations are done will the progress indicator
      // actually be removed.
      loadingViews = 0;
      //$loader = $(".about .loader");

  B.Views.Progressify = function() {
    loadingViews += 1;
    S.trigger("searchStart");
  };

  B.Views.Done = function() {
    if (loadingViews === 1) {
      S.trigger("searchStop");
    }
    loadingViews -= 1;
  };

  /**
   * The overarching application view manager.
   */
  B.Views.AppView = Backbone.View.extend({
    id: "#main",

    initialize: function(attributes) {
      this.el = $(this.id);
    },

    render: function() {

      this.leftView = new B.Views.LeftView();
      this.leftView.render();

      this.rightView = new B.Views.RightView();

      // right view rendering left for search!
      return this;
    },

    cleanup: function() {
      this.leftView.cleanup();
      this.rightView.cleanup();
    }
  });

  B.Views.LeftView = Backbone.View.extend({
    id: "#left-container",

    initialize: function(attributes) {
      this.el = $(this.id);

      // when the collection of startups is done loading,
      // render the tag cloud
      ALT.app.startupCollection.bind("done", this.addTags, this);
    },

    render: function() {

      // render search view
      this.searchView = new S.Views.SearchView();
      this.searchView.render();
    },

    addTags: function() {

      var tagContainer = $("#tag-container"),
          // render a list of tags when were ready.
          tags = ALT.app.startupCollection.markets();

      this.tagListView = new U.TagList({}, { tags: tags });
      tagContainer.html(this.tagListView.render().el);
    },

    cleanup: function() {

      // unbind
      ALT.app.startupCollection.unbind("done", this.addTags);

      // remove the list of tags
      this.tagListView.cleanup();

      // note, no cleanup required on search. we ammend that.
    }
  });

  B.Views.RightView = Backbone.View.extend({
    id: "#right-container",

    initialize: function(attributes) {
      this.el = $(this.id);
    },

    render: function() {

      // Create a new startup collection
      var tags = ALT.app.currentTags.pluck("id").join(",");
      ALT.app.currentTags.tags = tags;

      // Create a new metadata view.
      this.metadataView = new B.Views.Panels.Metadata({
        collection: ALT.app.startupCollection
      });

      // remove the about info if it's there
      $("#startup-data-container .about").remove();
      $("#startup-list-container").show();
      $("#startup-info-container").css({
        top: $("#metadata-container").height() + 150
      });

      // Create a new startup list collection view
      // which will also create the startupInfoView
      this.startupListView = new ST.Views.List({
        collection: ALT.app.startupCollection,
        tags: tags
      });
    },

    cleanup: function() {
      if (this.metadataView) {
        this.metadataView.cleanup();
      }
      if (this.startupListView) {
        this.startupListView.cleanup();
      }
    }
  });

  // Just a container for all our panel views

  B.Views.Panels = {};
  /**
   * A container for metadata about the currently searched tags.
   * contains:
   *   metadata about search
   *   metadata about valuation
   */
  B.Views.Panels.Metadata = Backbone.View.extend({
    id: "#metadata-container",
    template: "#metadata-search",

    initialize: function() {

      // init housing element & template
      this.el = $(this.id);

      // add the border. We remove it while things are loading.
      this.$(".inner").addClass("border");

      // Create new metadata valuation view
      // it takes care of it's own rendering.
      this.metadataValuationView = new B.Views.Panels.MetadataValuation();

      // Create a new metadata search view
      this.metadataSearchView = new B.Views.Panels.MetadataSearch({
        collection: this.collection
      });
    },

    cleanup: function() {
      this.metadataValuationView.cleanup();
      this.metadataSearchView.cleanup();
    }
  });

  /**
   * View for range slider and select dropdown
   */
  B.Views.Panels.MetadataSearch = Backbone.View.extend({
    template: "metadata-search",
    id: "#metadata-startup-container",

    initialize: function(attributes, options) {

      // this.collection is set to startup list!

      // find element
      this.el = $(this.id);

      // Get compile templated from cache
      this.template = ALT.app.templates[this.template];

      // render container shell
      this.render();

      // When the first page of the collection is fetched,
      // show the control interface (although keep things disabled, like)
      // the select control.
      this.collection.bind("start", this.bindStart, this);

      // When a collection fetches a new page, update some counts
      this.collection.bind("page", this.bindPage, this);

      // When the last page of the collection is loaded, finish
      // whatever rendering we have left.
      this.collection.bind("done", this.finish, this);
    },

    bindStart: function() {
      this.$(".details").show();
      this.$(".sort").show();
      this.$("span#startup-total-count").html(this.collection.total_startups);

    },

    bindPage: function() {
      this.$("span#startup-list-counts").html(this.collection.length);
    },

    cleanup: function() {

      this.delegateEvents({});

      this.el.html(
        this.template()
      );

      this.$("#range").hide();

      this.collection.unbind("start", this.bindStart);
      this.collection.unbind("page", this.bindPage);
      this.collection.unbind("done", this.finish);

      // disable the sorting until we're done loading everything
      this.$("select").attr("disabled", "disabled");

      this.el.html("<h2>Loading...</h2>");
    },

    render: function() {

      this.el.html(
        this.template()
      );

      this.delegateEvents({
        "click #load-more-startups": "onLoadMore",
        "change select": "onSelect"
      });

      // disable the sorting until we're done loading everything
      this.$("select").attr("disabled", "disabled");

      return this;
    },

    finish: function() {
      if (this.collection.length) {
        // Enable sorting select
        this.$("select").removeAttr("disabled");

        this.makeRangeSlider();
        this.makeSparkline();
      }
    },

    onSelect: function(event) {

      var value = event.target.value,
          // Cache Selection match references
          $range = $("#range"),
          $decay = $("#about-decay-over-time");

      // When a new sort is selected, tell the list to
      // handle it
      this.collection.trigger("alt.resort", value);

      // hide the appropriate counts in the startup list
      ALT.app.mainView.rightView.startupListView.hideCounts(value);

      // hide the range selectors if it's not followers
      if (value !== "follower_count") {
        $range.slideUp();
      } else {
        $range.slideDown("slow");
      }

      // show the about follower trends message
      if (value === "followers_over_time") {
        $decay.slideDown();
      } else {
        $decay.slideUp();
      }
    },

    onLoadMore: function(event) {

      // Add a few pages to the collection max pages.
      var oldPages = ALT.app.startupCollection.pages;
      this.collection.pages = Math.min(
        oldPages + 10,
        this.collection.total_pages
      );

      // If we actually increased the page size
      if (oldPages < this.collection.pages) {

        this.collection.fetch({

          // on the first page, render a side panel
          success: _.bind(function(collection) {

            // trigger that another page was fetched of the collection
            collection.trigger("page");

          }, this)
        });
      }
    },

    makeRangeSlider: function(collection) {
      // make a range slider
      this.$("#range").show();
      var vals = this.collection.pluck("follower_count"),
          min = _.min(vals),
          max = _.max(vals);

      this.$("#slider-range").slider({
        range: true,
        min: min,
        max: max,
        values: [min, max],
        step: 10,
        slide: function(event, ui) {
          $("#slider-range-left").html(ui.values[0]);
          $("#slider-range-right").html(ui.values[1]);
        },
        stop: _.bind(
            function(event, ui) {
              // find all startups who's follower counts are between ranges.
              var subset = this.collection.select(function(startup) {
                return (startup.get("follower_count") >= ui.values[0] &&
                        startup.get("follower_count") <= ui.values[1]);
              });

              // update the layout with subset
              ALT.app.mainView.rightView.startupListView.update(subset);
          }, this)
      });
      $("#slider-range-left").html(min);
      $("#slider-range-right").html(max);
    },

    makeSparkline: function(collection) {

      // make a sparkline of follower counts
      this.$(".slider-sparkline").sparkline(
        this.collection.histogram(30),
        {
          type: "bar",
          width: "100%",
          barColor: "orange",
          lineColor: "none",
          zeroColor: "#ddd"
        });
      this.$(".slider-sparkline canvas").css({ width: "100%" });
    }
  });

  B.Views.Panels.MetadataValuation = Backbone.View.extend({
    template: "metadata-valuation",
    id: "#metadata-valuation-container",

    initialize: function() {

      // find element
      this.el = $(this.id);

      // Get compile templated from cache
      this.template = ALT.app.templates[this.template];

      // --- get metadata from server
      // get current tags
      var tags = ALT.app.currentTags.pluck("id").join(",");

      // Fetch stats about the tags if they exist
      if (tags.length) {

        // Stats model (valuation data)
        this.model = new S.Models.SearchStats({}, {
          tags: tags
        });

        // When data is fetched, render this view.
        this.model.fetch({
          success: _.bind(function(model) {
            this.render();
          }, this)
        });
      }
    },

    render: function() {

      // Render valuation data into its container.
      this.el.html(
        this.template({
          stats: this.model.toJSON()
        })
      );

      return this;
    },

    cleanup: function() {
      this.el.html("");
    }
  });


  /**
   * A container for the metadata about a startup.
   */
  B.Views.Panels.StartupInfo = Backbone.View.extend({
    id: "#startup-info-container",
    initialize: function(attributes, options) {
      this.el = $(this.id);

      if (this.model) {
        this.model.fetch({
          success: _.bind(function(model) {
            this.model = model;
            this.render();
          }, this),
          error: this.renderEmpty
        });
      } else {
        this.renderEmpty();
      }
    },

    render: function() {

      var fullPanel = new ST.Views.Full({
        model: this.model
      });
      this.el.html(fullPanel.render().el);

      return this;
    },

    renderEmpty: function(message) {
      message = message || "<h3> No Startups Found </h3>";
      this.el.html("");
      return this;
    }
  });

})(ALT.module("base"));
