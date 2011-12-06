(function(Base) {
  
  Base.Models || (Base.Models = {});
  Base.Collections || (Base.Collections = {});

  // Responsible for holding a single search.
  Base.Models.Search = Backbone.Model.extend({});
    
  // A single search result entry
  Base.Models.SearchItem = Backbone.Model.extend({});
  
  // A container of search results
  Base.Collections.SearchItems = Backbone.Collection.extend({
    model : Base.Collections.SearchItem,
    initialize: function(collections, options) {
      this.search = options.search;
    },
    url : function() {
      return "http://api.angel.co/1/search?query=" + this.search.get("query");
    }
  });
  
  /**
   * Contains all the search boxes.   
   */                                                                                                                                                                                                                                                                                    
  Base.Views.SearchView = Backbone.View.extend({
    id : '#search-container',
    template : '#search-container-tmpl',
        
    initialize: function(attributes) {
      this.el = $(this.el);
      this.template = _.template($(this.template).html());
      this._searchComponents = {
        location : null,
        market : null,
        person : null
      }
    },
    
    render : function() {
      
      // Render template
      this.el.html(this.template());
      
      // TODO: Append 3 search components
      this._searchComponents.location = new Base.Views.SearchComponentView({
        type : "LocationTag",
        collection : new Base.Collections.SearchItems({}, { search : new Base.Models.Search()})
      });
      
      this._searchComponents.market = new Base.Views.SearchComponentView({
        type : "MarketTag",
        collection : new Base.Collections.SearchItems({}, { search : new Base.Models.Search()})
      });
      
      this._searchComponents.person = new Base.Views.SearchComponentView({
        type : "Follow",
        collection : new Base.Collections.SearchItems({}, { search : new Base.Models.Search()})
      });
      
      this.el.append(this._searchComponents.location.render().el);
      this.el.append(this._searchComponents.market.render().el);
      this.el.append(this._searchComponents.person.render().el);
      
      return this;
    }
  });
  
  /**
   * An individual search component.
   */
  Base.Views.SearchComponentView = Backbone.View.extend({
    className : "single-search-container",
    template  : "#single-search-container-tmpl",
    events : {
      "keyup input" : "onKeyPress"
    },
    initialize: function(attributes) {
      this.template = _.template($(this.template).html());
      $(this.el).attr({ "id" : "search-" + attributes.type });
      
      // bind to the search change, to fetch the collection.
      this.collection.search.bind("change:query", function(event) {

        // perform the search.
        this.collection.fetch();
      }, this);
    },
    render : function() {
      
      // Render search component.
      $(this.el).html(this.template());
      
      return this;
    },
    
    onKeyPress : function(e) {
      // TODO: handle typing here.
      // do a search
      // append li's to "ul.search-tags" for selected tags
      this.collection.search.set({"query" : this.$('input').val()});
      console.log(e, this.$('input').val(), this.collection.search.attributes);
    }
  });
  
  
  
})(ALT.module("base"));