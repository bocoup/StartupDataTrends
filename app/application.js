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
      "?code=:code" : "authorize",
      "": "index"
    },

    index: function() {
      
      // make initial oauth2 request
      var url = "https://angel.co/api/oauth/authorize?" +
        "client_id=7aa609a197a35b1b7de6b6d6584d5d02&" +
        "response_type=code";
        
      window.location = url;
    },
    
    authorize: function(code) {
      // get session
      var base = ALT.module("base");
      session = new base.Session({ code : code });
      // session.fetch({ success : function(model) {
      //         console.log(model);
      //       }});

      var mainView = new base.Views.AppView();
      mainView.render();
    }
  });
  
  app.router = new Router();
  Backbone.history.start({ pushState: true });
});
