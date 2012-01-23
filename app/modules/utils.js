/**
 * Startup Data Trends
 * Author Irene Ros (Bocoup)
 */
(function(U) {
  
  U.precompileTemplates = function() {
    ALT.app.templates = {};

    // cache all compiled templates
    $('script[type=text\\/template]').each(function(index, elm) {
      elm = $(elm);
      ALT.app.templates[elm.attr('id')] = _.template(elm.html());
    });
  };
  /** 
   * Formats a number into an actual dollar amount.
   * @param val The value to convert.
   */
  U.formatDollarAmount = function(val) {
    val = "" + val;
    var delimiter = ",",
        amountStr = val.split(".", 2),      // remove decimals
        decimals  = amountStr[1] || 0,         // save decimal point
        amount    = parseInt(amountStr[0], 10); // parse amount to int
        
    if (isNaN(amount)) {
    
      return "$0";
    
    } else {
      var clone = "" + amount;
      var parts = [];
      // break string into threes.
      while (clone.length > 3) {
        var sub = clone.substr(clone.length-3);
        parts.unshift(sub);
        clone = clone.substr(0, clone.length-3);
      }
      // grab any remaining pieces.
      if (clone.length > 0) {
        parts.unshift(clone);
      }

      return "$" + parts.join(delimiter);
    }
  };

  /**
   * Returns the frequency count of an array of objects.
   * @param { Array } arr Array of objects
   * @param { String } prop The property inside the array objects to count
   * @returns { Array } [[key, count], [key, count]].
   */ 
  U.frequencyCount = function(arr, prop, id) {
    var freq = {};

    _.each(arr, function(obj) {
      var key = obj[prop];
      freq[key] = (freq[key] || [key, 0]);
      freq[key][freq[key].length-1]++;
      
      if (typeof id !== "undefined" && freq[key].length < 3) {
        freq[key].unshift(obj[id]); 
      }
    });

    return _.sortBy(_.values(freq), function(pair) {
      return -pair[pair.length-1];
    });
  };

  U.remap = function(value, min, max, start, end) {
    return ((value / (max - min)) * (end - start)) + start;
  };

  U.Stats = function(a) {
    var r = { 
      mean: 0, 
      variance: 0, 
      deviation: 0
    }, t = a.length;
    
    // sum up items.
    for (var m, s = 0, l = t; l--;){
      s += a[l];
    }
    
    m = r.mean = s / t;
    for (l = t, s = 0; l--;){
      s += Math.pow(a[l] - m, 2);
    }

    r.deviation = Math.sqrt(r.variance = s / t);
    return r;
  };

  U.TagList = Backbone.View.extend({
    template : 'tag-count-list',

    initialize : function(attributes, options) {
      this.template = ALT.app.templates[this.template];

      this.tags = options.tags;

      this.metrics = {
        maxFontSize : 19,
        minFontSize : 10,
        maxCount : this.tags[0][2],
        minCount : this.tags[this.tags.length-1][2]
      };
      this.tag_template = ALT.app.templates["single-tag-count"];
    },

    render : function() {
      
      this.el = $(this.template());

      var count = Math.min(this.tags.length, 15);
      var otherTagList = ALT.app.currentTags.pluck("id");

      for (var i = 0; i < count; i++) {
        var tag = this.tags[i];

        // don't bother painting the selected tag.
        if (otherTagList.indexOf(tag[0]) === -1) {
          var fontSize = U.remap(
            tag[2], 
            this.metrics.minCount, 
            this.metrics.maxCount, 
            this.metrics.minFontSize, 
            this.metrics.maxFontSize);
          var tagEl = $(this.tag_template({
            
            tag : {
              id : tag[0],
              name : tag[1],
              count : tag[2],
              url : _.union(otherTagList, tag[0]).join(",")
            }
          })).css({
            "font-size" : fontSize
          });
          $(this.$('ul.taglist')).append(tagEl);
        }
      } 
      return this;
    },

    cleanup : function() {
      this.el = $(this.template());
    }

  });

  // Create a prefilter to attach the options onto the jqXHR.
  // This is required so the LiveCollection can access the originalOptions
  // passed by Backbone.sync.
  $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
    if (!jqXHR.originalOptions) {
      jqXHR.originalOptions = originalOptions;
    }
  });

  // Requires the ajaxPrefilter
  U.LiveCollection = Backbone.Collection.extend({
    sync: function(method, model, options) {
      if (this.append) {
        options.add = true;
      }
      
      var jqXHR;
      var pageParams = _.clone(options);

      // make first request, then on success, make all subsequent requests
      function fetchPages(start, end) {
        var i, jqXHR, params;
        var defs = [];

        for (i = start; i <= end; i++) {
          // Augment the pageParams object with each new page
          params = _.extend(pageParams, {
            url: model.url(i),
            success: function(data) {
              model.page += 1;

              if (options.success) {
                options.success(data);
              }

              // if this is the last page, call the done callback if we have one
              if ((model.page - 1 == model.pages) && options.done) {
                options.done(model);
              }
            }
          });

          // Create a new Backbone.sync jqXHR instance.
          jqXHR = Backbone.sync("read", model, params);

          // Push this to the list of deferreds.
          defs.push(jqXHR);
        }

        // Mimics the Backbone.sync behavior, by returning a promise.
        return $.when.apply(null, defs);
      }

      // we are getting total number of pages from the first call
      // and then going to fetch everything
      function success(data) {
        if (model.page === 1) {
          model.pages = Math.min(model.page_max, data[model.pages_attribute]);  
          model.total_pages = data[model.pages_attribute];
        }
        
        // process first page
        options.success(data);
        model.page += 1;

        // if this is the last page, call the done callback if we have one
        if ((model.page - 1 == model.pages) && options.done) {
          options.done(model);
        }

        return fetchPages(model.page, model.pages);
      }

      // do we know how many pages we are already fetching? If so
      // just make N simultaneous requests.
      if (model.pages_attribute == null) {
        // Invoke the native Backbone.sync and re-assign the passed options.
        jqXHR = fetchPages(model.page, model.pages);
        pageParams = jqXHR.originalOptions;
        
        return jqXHR;
      }

      pageParams.success = success;

      return Backbone.sync("read", model, pageParams);
    }
  });

})(ALT.module("utils"));
