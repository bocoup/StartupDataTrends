/**
 * Startup Data Trends
 * Author Irene Ros (Bocoup)
 */
(function(S, U) {
  
  S.Models = (S.Models || {});
  S.Collections = (S.Collections || {});

  // Responsible for holding a single search.
  S.Models.Search = Backbone.Model.extend({});

  // Responsible for holding a single tag - particularly useful
  // when loading from a url with tags in it.
  S.Models.Tag = Backbone.Model.extend({
    url : function() {
      return "http://api.angel.co/1/tags/" + this.id + "?callback=?"; 
    },
    triggerSearch : function() {
      this.set({ "triggerSearch" : true });
    }
  });

  // Responsible for search metadata
  S.Models.SearchStats = Backbone.Model.extend({
    initialize : function(attributes, options) {
      this.tags = options.tags;
    },
    url : function() {
      return "http://api.angel.co/1/tags/stats?tag_ids=" + this.tags + 
        "&callback=?";
    },
    parse : function(data) {
      data.raising.amount = U.formatDollarAmount(data.raising.amount);
      data.pre_money.amount = U.formatDollarAmount(data.pre_money.amount);
      return data;
    }
  });
    
  // A single search result entry
  S.Models.SearchItem = Backbone.Model.extend({});
  
  // A container of search results
  S.Collections.SearchItems = Backbone.Collection.extend({
    model : S.Collections.SearchItem,
    initialize: function(collections, options) {
      this.search = options.search;
    },
    url : function() {
      // TODO: want to have a way to restrict the type of search!
      return "http://api.angel.co/1/search?query=" + this.search.get("query") + "&type=" + this.search.get("type") + "&callback=?";
    },
    autocompleteItems : function() {
      return this.map(function(model) {
        return {
          id : model.id, 
          label : model.get("name"),
          value : model.get("value") 
        };
      });
    }
  });
  
  /**
   * Contains all the search boxes.   
   */                                                                                                                                                                                                                                                                                    
  S.Views.SearchView = Backbone.View.extend({
    id : '#search-container',
    template : 'search-container-tmpl',
        
    initialize: function(attributes) {
      this.el = $(this.id);
      this.template = ALT.app.templates[this.template];
      this._searchComponents = {
        location : null,
        market : null,
        person : null
      };
    },

    addTag : function(tag) {
      
      // hide about
      $('.about .info').hide();
      $('.about .loader').slideDown();

      var tagView = new S.Views.SearchSelectedComponentItem({ 
        model : tag 
      });
      this.$(".search-tags")
        .append(tagView.render().el);
    },
    
    render : function() {
      
      // Render template
      this.el.append(this.template());
      
      // TODO: Append 3 search components
      this._searchComponents.location = new S.Views.SearchComponentView({
        collection : new S.Collections.SearchItems({}, { search : new S.Models.Search({
          type : "LocationTag",
          name : "Location"
        })})
      });
      
      this._searchComponents.market = new S.Views.SearchComponentView({
        collection : new S.Collections.SearchItems({}, { search : new S.Models.Search({
          type : "MarketTag",
          name : "Market"
        })})
      });
        
      this.el.prepend(this._searchComponents.market.render().el);  
      this.el.prepend(this._searchComponents.location.render().el);
      
      return this;
    }

  });
  
  /**
   * A single selected item that gets appended at the end of a
   * autocomplete dropdown
   */
  S.Views.SearchSelectedComponentItem = Backbone.View.extend({
    template : "single-search-item-tmpl",
    events : {
      "click .close" : "onClose"
    },
    initialize: function(attributes, options) {
      this.template = ALT.app.templates[this.template];
    },

    render : function() {
      $(this.el).html(this.template({
        id : this.model.id,
        label : this.model.get("label") || this.model.get("display_name")
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
  S.Views.SearchComponentView = Backbone.View.extend({
    className : "c25 single-search-container",
    template  : "single-search-container-tmpl",

    initialize: function(attributes, options) {
      
      // save Search information attributes
      this.search = this.collection.search;
      
      this.template = ALT.app.templates[this.template];

      $(this.el).attr({ "id" : "search-" + this.search.get("type") });
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
          this.$('.search-loader').addClass("searching");
          this.collection.fetch({
            success: _.bind(function(collection) {
              this.$('.search-loader').removeClass("searching");
              response(collection.autocompleteItems());
            },this)
          });
        }, this),
        minLength: 2,
        select : _.bind(function(event, ui) {
            // TODO: append item to list
            // TODO: clear search
            // Add a tag to the current list of tags

            var tagModel = new S.Models.Tag(ui.item);
            tagModel.set({ 
              "tag_type" : this.search.get("type")
            }, { silent:true });
            
            // rendering happens on tag add, not here. This is
            // to support url based searches.
            tagModel.triggerSearch();
            ALT.app.currentTags.add(tagModel);
          
          }, this),
        close : function(event) {
          $(event.target).val("").focus();
        },
        blur : function(event) {
          $(event.target).val("").focus();
        }
      });
      return this;
    }
  });
})(ALT.module("search"), ALT.module("utils"));