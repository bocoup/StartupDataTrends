(function(Base) {
  
  /**
   * The overarching application view manager.
   */
  Base.Views.AppView = Backbone.View.extend({
    el : '#main',
    
    initialize: function(attributes) {
      this.el = $(this.el);
    },
    
    render : function() {
      
      // Append search view
      var searchView = new Base.Views.SearchView();
      this.el.append(searchView.render().el);
      
      // TODO: Instantiate Main Panel View
      
      return this;
    }
  });
  
  Base.Session = Backbone.Model.extend({
    
    initialize: function(attrs, options) {
      this.set({
        "client_id" : "7aa609a197a35b1b7de6b6d6584d5d02",
        "client_secret" : "bbf7f3b7bf96ad82bc26cc27b7d2339e"
      });
    },
    
    url : function() {
      return "https://angel.co/api/oauth/token?" + 
        this.get("client_id") + 
        "&client_secret=" + this.get("client_secret") +
        "&code=" + this.get("code") +
        "&grant_type=authorization_code"
    },
    
    fetch : function(options) {
      // options || (options = {});
      //       var model = this;
      //       var success = options.success;
      //       options.success = function(resp, status, xhr) {
      //         if (!model.set(model.parse(resp, xhr), options)) return false;
      //         if (success) success(model, resp);
      //       };
      //       options.error = wrapError(options.error, model, options);
      //       return (this.sync || Backbone.sync).call(this, 'create', this, options);
      
      $.post("https://angel.co/api/oauth/token?" +
        "client_id=7aa609a197a35b1b7de6b6d6584d5d02&" +
        "client_secret=36fd3aa2647f74fac539ad185875d55f&" +
        "code=" + this.get("code") + "&" +
        "grant_type=authorization_code").success(function(r) { 
          console.log(r); 
      });
    }
  });
  
  
})(ALT.module("base"));