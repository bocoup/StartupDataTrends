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
      // TODO: want to have a way to restrict the type of search!
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
        name : "Location",
        collection : new Base.Collections.SearchItems({}, { search : new Base.Models.Search()})
      });
      
      this._searchComponents.market = new Base.Views.SearchComponentView({
        type : "MarketTag",
        name : "Market",
        collection : new Base.Collections.SearchItems({}, { search : new Base.Models.Search()})
      });
      
      this._searchComponents.person = new Base.Views.SearchComponentView({
        type : "Follow",
        name : "Person",
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

    initialize: function(attributes, options) {
      
      // save base information attributes
      this.type = attributes.type;
      this.name = attributes.name;
      
      this.template = _.template($(this.template).html());

      $(this.el).attr({ "id" : "search-" + attributes.type });
    },
    render : function() {
      
      // Render search component.
      $(this.el).html(this.template({
        id : this.type,
        type : this.name
      }));
      
      // enable jquery autocomplete dropdown
      this.$("input").autocomplete({
        source : _.bind(function(request, response) {
          console.log(request, response);
          this.collection.search.set({ "query" : request.term }, { silent: true });
          this.collection.fetch({
            success: response(this.collection.toJSON())
          });
        }, this),
        minLength: 2
      });
      return this;
    }
  });
  
  
  
})(ALT.module("base"));