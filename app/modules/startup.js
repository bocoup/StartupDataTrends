(function(ST) {

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
    },
    url : function() {
      // TODO: rewrite this eventually to use our collected search tags
      // for now just return a canned list.
      // return "https://api.angel.co/1/search?query=jobs&type=Startup&callback=?" 
      
      return "http://api.angel.co/1/startups?tag_ids=" + this.tags + "&order=popularity&callback=?"
    },
    parse : function(data) {
      return _.select(data.startups, function(startup) {
        return startup.hidden === false;
      });
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
      this.$("#tabs").tabs();
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

})(ALT.module("startup"));