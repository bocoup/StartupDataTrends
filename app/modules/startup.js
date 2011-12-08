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
    model : ST.Models.Startup
  });

  
  ST.Views.Startup = Backbone.View.extend({
    initialize: function(attributes, options) {
      this.template = _.template($(this.template).html());
      this.el = $(this.el);
    }
  });
  ST.Views.Startup.Full = ST.Views.Startup.extend({
    template : "#panel-startup-full",
    render : function() {
      this.el.html(this.template({ startup : this.model.toJSON() }));
      this.$("#tabs").tabs();
      return this;
    }
  });
  ST.Views.Startup.Mini = ST.Views.Startup.extend({
    templtae : "#panel-startup-mini"
  });

})(ALT.module("startup"));