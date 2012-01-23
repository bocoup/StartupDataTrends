/**
 * Startup Data Trends
 * Author Irene Ros (Bocoup)
 */
(function(U) {

  U.precompileTemplates = function() {
    ALT.app.templates = {};

    // cache all compiled templates
    $("script[type='text/template']").each(function(index, elm) {
      elm = $(elm);
      ALT.app.templates[elm.attr("id")] = _.template(elm.html());
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
    template: "tag-count-list",

    initialize: function(attributes, options) {
      this.template = ALT.app.templates[this.template];

      this.tags = options.tags;

      this.metrics = {
        maxFontSize: 19,
        minFontSize: 10,
        maxCount: this.tags[0][2],
        minCount: this.tags[this.tags.length-1][2]
      };
      this.tag_template = ALT.app.templates["single-tag-count"];
    },

    render: function() {

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

            tag: {
              id: tag[0],
              name: tag[1],
              count: tag[2],
              url: _.union(otherTagList, tag[0]).join(",")
            }
          })).css({
            "font-size": fontSize
          });
          $(this.$("ul.taglist")).append(tagEl);
        }
      }
      return this;
    },

    cleanup: function() {
      this.el = $(this.template());
    }

  });

})(ALT.module("utils"));