/**
 * Startup Data Trends
 * Author Irene Ros (Bocoup)
 */
(function(U) {

  U.precompileTemplates = function() {
    ALT.app.templates = {};

    // Select, compile and cache all templates
    // Provides significant performance benefits when rendering views
    $("script[type='text/template']").each(function() {
      var $this = $(this);
      ALT.app.templates[$this.attr("id")] = _.template($this.html());
    });
  };
  /**
   * Formats a number into an actual dollar amount.
   * @param val The value to convert.
   */
  U.formatDollarAmount = function(val) {
    val = "" + val;
    var delimiter = ",",
        // remove decimals
        amountStr = val.split(".", 2),
        // save decimal point
        decimals = amountStr[1] || 0,
        // parse amount to int
        amount = parseInt(amountStr[0], 10),
        // Initialize, no assign
        clone, parts, sub;

    if (isNaN(amount)) {

      return "$0";

    } else {
      clone = "" + amount;
      parts = [];

      // break string into threes.
      while (clone.length > 3) {
        sub = clone.substr(clone.length-3);
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
    var freq = {},
        key;

    _.each(arr, function(obj) {
      key = obj[prop];

      freq[key] = (freq[key] || [key, 0]);
      freq[key][freq[key].length-1]++;

      if (id != null && freq[key].length < 3) {
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
    },
    t = a.length,
    len = t,
    sum = 0,
    m;

    // sum up items.
    for (; len--;){
      sum += a[len];
    }

    m = r.mean = sum / t;
    for (len = t, sum = 0; len--;){
      sum += Math.pow(a[len] - m, 2);
    }

    r.deviation = Math.sqrt(r.variance = sum / t);
    return r;
  };

  U.TagList = Backbone.View.extend({
    template: "tag-count-list",

    initialize: function(attributes, options) {
      // Get compiled template from cache
      this.template = ALT.app.templates[this.template];

      this.tags = options.tags;
      if (this.tags.length) {
        this.metrics = {
          maxFontSize: 19,
          minFontSize: 10,
          maxCount: this.tags[0][2],
          minCount: this.tags[this.tags.length-1][2]
        };
        this.tag_template = ALT.app.templates["single-tag-count"];
      }
    },

    render: function() {

      this.el = $(this.template({
        message : this.tags.length ? 
          "Matching startups also tagged with..." : 
          "No startups found"
      }));

      var count = Math.min(this.tags.length, 15),
          otherTagList = ALT.app.currentTags.pluck("id"),
          i = 0,
          tag, tagEl, fontSize;

      for ( ; i < count; i++) {
        tag = this.tags[i];

        // don't bother painting the selected tag.
        if (otherTagList.indexOf(tag[0]) === -1) {
          fontSize = U.remap(
            tag[2],
            this.metrics.minCount,
            this.metrics.maxCount,
            this.metrics.minFontSize,
            this.metrics.maxFontSize
          );

          tagEl = $(
            this.tag_template({
              tag: {
                id: tag[0],
                name: tag[1],
                count: tag[2],
                url: _.union(otherTagList, tag[0]).join(",")
              }
            })
          ).css({
            fontSize: fontSize
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