/**
 * Startup Data Trends
 * Author Irene Ros (Bocoup)
 */
// Namespace: ALT - AngelListTrends.


ALT.module = (function() {
  var modules = {};

  return function(name) {
    if (modules[name]) {
      return modules[name];
    }

    return (modules[name] = { Views: {} });
  };
})();

ALT.app = _.extend(ALT.app, Backbone.Events);

jQuery(function($) {
  var app = ALT.app,
      Router,
      // U = ALT.module("utils"),
      // S = ALT.module("search"),
      B = ALT.module("base"),
      ST = ALT.module("startup");

  // Only need this for pushState enabled browsers
  if (Backbone.history && Backbone.history._hasPushState) {
    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router.  If the link has a data-bypass
    // attribute, bypass the delegation completely.
    $(document).on("click", "a:not([data-bypass])", function(evt) {
      // Get the anchor href and protcol
      var href = $(this).attr("href"),
          protocol = this.protocol + "//";

      // Ensure the protocol is not part of URL, meaning its relative.
      if (href && href.slice(0, protocol.length) !== protocol) {
        // Stop the default event to ensure the link will not cause a page
        // refresh.
        evt.preventDefault();

        // This uses the default router defined above, and not any routers
        // that may be placed in modules.  To have this work globally (at the
        // cost of losing all route events) you can change the following line
        // to: Backbone.history.navigate(href, true);
        app.router.navigate(href, true);
      }
    });
  }

  Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "?tags=:tags": "search"
    },

    _init: function() {

      // create a holder for startups
      ALT.app.startupCollection = new ST.Collections.Startups([], {
        page_max: 5,
        pages_attribute: "last_page"
      });

      // initialize list of current tags
      ALT.app.currentTags = new Backbone.Collection();

      // Pretty much all functionality is routed through this callback.
      // When a tag is added or removed from the searchable list, all
      // UIs update, all calls are made etc.
      ALT.app.currentTags.bind("add", function(model) {

        // reset collection

        ALT.app.startupCollection.clear();

        // update search view
        ALT.app.mainView.leftView.searchView.addTag(model);

        // Only perform a search on a tag that is market as such. This is
        // key because if a user comes in via a url with a tag list,
        // we only want to perform the search on all tags together, not
        // individually.
        // A regular tag search through form will mark each tag
        // as search-triggering.
        if (model.get("triggerSearch")) {

          // redo the search
          ALT.app.mainView.rightView.cleanup();
          ALT.app.mainView.rightView.render();

          // update url
          this.navigate("?tags=" + ALT.app.currentTags.pluck("id").join(","), false);
        }

      }, this);

      ALT.app.currentTags.bind("remove", function(model) {

        // if this was the last tag, reset url to root.
        if (ALT.app.currentTags.length === 0) {
          window.location = "/";
        }

        // reset collection
        ALT.app.startupCollection.clear();

        // redo the search
        ALT.app.mainView.rightView.cleanup();
        ALT.app.mainView.rightView.render();

        // update url
        this.navigate("?tags=" + ALT.app.currentTags.pluck("id").join(","), false);
      }, this);

      // Render the main view of the application.
      ALT.app.mainView = new B.Views.AppView();
      ALT.app.mainView.render();
    },

    index: function() {
      this._init();
    },

    search: function(tags) {
      this._init();

      var S = ALT.module("search"),
          // parse tags
          tagIds = tags.split(","),
          tagFetches = [],
          tagModels = [];

      // Initiate the fecth on each tag's metadata. This is
      // required to then do a startup search itself and display
      // what tags we're searching in the UI.
      _.each(tagIds, function(tagId) {
        var tag = new S.Models.Tag({ id: tagId });
        tagModels.push(tag);

        // Save the fetch calls so that we can attach a callback to
        // their successful completion.
        tagFetches.push(tag.fetch({
          silent: true
        }));
      });

      // When each tag is fetched, add it to the current tag list
      // but only peform the startup search at the end when all tags
      // have been fetched.
      $.when.apply(null, tagFetches).then(function(tag) {
        _.each(tagModels, function(tag, i) {

          // only search when all tags are present.
          if (tagModels.length-1 === i) {
            tag.triggerSearch();
          }

          // when available, add each tag to our list of
          // current tags.
          ALT.app.currentTags.add(tag);
        });
      });
    }

  });

  app.router = new Router();
  Backbone.history.start({ pushState: true });
});
