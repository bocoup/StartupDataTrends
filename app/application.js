// Namespace: ALT - AngelListTrends.
this.ALT = {
  module: function() {
    var modules = {};

    return function(name) {
      if (modules[name]) {
        return modules[name];
      }

      return modules[name] = { Views: {} };
    };
  }(),

  app: _.extend({}, Backbone.Events)
};


var session;
jQuery(function($) {
  var app = ALT.app;

  // Only need this for pushState enabled browsers
  if (Backbone.history && Backbone.history._hasPushState) {

    // Use delegation to avoid initial DOM selection and allow all matching elements to bubble
    $(document).delegate("a", "click", function(evt) {
      // Get the anchor href and protcol
      var href = $(this).attr("href");
      var protocol = this.protocol + "//";

      // Ensure the protocol is not part of URL, meaning its relative.
      // Stop the event bubbling to ensure the link will not cause a page refresh.
      if (href.slice(protocol.length) !== protocol) {
        evt.preventDefault();

        // Note by using Backbone.history.navigate, router events will not be
        // triggered.  If this is a problem, change this to navigate on your
        // router.
        app.router.navigate(href, true);
      }
    });

  }

  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "?tags=:tags" : "search"
    },

    _init : function() {

      var S = ALT.module("search");

      // initialize list of current tags
      ALT.app.currentTags = new Backbone.Collection();  

      ALT.app.currentTags.bind("add", function(model) {
        
        // update search view
        ALT.app.mainView.searchView.addTag(model);
        
        // redo the search
        ALT.app.mainView.panelView.render();
      });

      ALT.app.currentTags.bind("remove", function(model) {
        // redo the search
        ALT.app.mainView.panelView.render();
      });

      var base = ALT.module("base");

      ALT.app.mainView = new base.Views.AppView();
      ALT.app.mainView.render();
    },

    index: function() {
      this._init();
    },

    search : function(tags) {
      this._init();

      var S = ALT.module("search");

      // parse tags
      var tagIds = tags.split(","),
          tags = [];

      _.each(tagIds, function(tagId) {
        var tag = new S.Models.Tag({ id : tagId });
        tags.push(tag.fetch());
      });

      // fetch all tags 
      $.when.apply(this, tags).then(function(tag){
        console.log(tag);
        ALT.app.currentTags.add(tag);
      });
    }

  });
  
  app.router = new Router();
  Backbone.history.start({ pushState: true });
});
