(function(U) {
  
  /** 
   * Formats a number into an actual dollar amount.
   * @param val The value to convert.
   */
  U.formatDollarAmount = function(val) {
    var val = "" + val,
        delimiter = ",",
        amountStr = val.split(".", 2),      // remove decimals
        decimals  = amountStr[1] || 0,         // save decimal point
        amount    = parseInt(amountStr[0]); // parse amount to int
        
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
      freq[key] || (freq[key] = [key, 0]);
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

  U.TagList = Backbone.View.extend({
    tagName : "ul",
    className : "taglist",
    initialize : function(attributes, options) {
      this.tags = options.tags;
      this.metrics = {
        maxFontSize : 19,
        minFontSize : 10,
        maxCount : this.tags[0][2],
        minCount : this.tags[this.tags.length-1][2]
      };
      this.tag_template = _.template($("#single-tag-count").html());
    },

    render : function() {
      
      _.each(this.tags, function(tag) {
        
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
            count : tag[2]
          }
        })).css({
          "font-size" : fontSize
        });
        $(this.el).append(tagEl);
      
      }, this);  
      return this;
    }

  });

})(ALT.module("utils"));