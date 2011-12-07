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
      return "http://api.angel.co/1/search?query=" + this.search.get("query") + "&callback=?";
    },
    autocompleteItems : function() {
      return this.map(function(model) {
        return {
          id : model.id,
          label : model.get("name"),
          value : model.get("value") 
        }
      });
    },
    parse: function(data) {
      var sub_data = [];
      _.each(data, function(searchResult) {
        if (searchResult.type === this.search.get("type")) {
          sub_data.push(searchResult);
        }
      }, this);
      return sub_data;
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
        collection : new Base.Collections.SearchItems({}, { search : new Base.Models.Search({
          type : "LocationTag",
          name : "Location"
        })})
      });
      
      this._searchComponents.market = new Base.Views.SearchComponentView({
        collection : new Base.Collections.SearchItems({}, { search : new Base.Models.Search({
          type : "MarketTag",
          name : "Market"
        })})
      });
      
      this._searchComponents.person = new Base.Views.SearchComponentView({
        collection : new Base.Collections.SearchItems({}, { search : new Base.Models.Search({
          type : "User",
          name : "Person"
        })})
      });
      
      this.el.append(this._searchComponents.location.render().el);
      this.el.append(this._searchComponents.market.render().el);
      this.el.append(this._searchComponents.person.render().el);
      
      return this;
    }
  });
  
  /**
   * A single selected item that gets appended at the end of a
   * autocomplete dropdown
   */
  Base.Views.SearchSelectedComponentItem = Backbone.View.extend({
    template : "#single-search-item-tmpl",
    events : {
      "click .close" : "onClose"
    },
    initialize: function(attributes, options) {
      this.template = _.template($(this.template).html());
    },

    render : function() {
      $(this.el).html(this.template({
        id : this.model.id,
        label : this.model.get("label")
      }));
      return this;
    },

    onClose : function(event) {
      event.preventDefault();
      var value = this.$('a').attr('data-id');
      var model = ALT.app.currentTags.get(value);
      // delete current tag model
      ALT.app.currentTags.remove(model);

      // delete this thing
      this.remove();
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
      this.search = this.collection.search;
      
      this.template = _.template($(this.template).html());

      $(this.el).attr({ "id" : "search-" + attributes.type });
    },
    render : function() {
      
      // Render search component.
      $(this.el).html(this.template({
        id : this.search.get("type"),
        type : this.search.get("name")
      }));
      
      // enable jquery autocomplete dropdown
      this.$("input").autocomplete({
        source : _.bind(function(request, response) {
          this.collection.search.set(
            { "query" : request.term }, 
            { silent: true }
          );
          this.collection.fetch({
            success: function(collection) {
              response(collection.autocompleteItems());
            }
          });
        }, this),
        minLength: 2,
        select : _.bind(function(event, ui) {
            // TODO: append item to list
            // TODO: clear search
            // Add a tag to the current list of tags

            var tagModel = new Backbone.Model(ui.item);
            ALT.app.currentTags.add(tagModel);

            // Render a new selected tag list item
            var tagView = new Base.Views.SearchSelectedComponentItem({ model : tagModel });
            
            // Append them to the tag list we're building of all
            // the tags we're watching for this dropdown.
            this.$(".search-tags").append(tagView.render().el);
            
            
          }, this),
        close : function(event) {
          $(event.target).val(" ").focus();
        },
        blur : function(event) {
          $(event.target).val(" ").focus();
        }
      });
      return this;
    }
  });
  
  
  
})(ALT.module("base"));