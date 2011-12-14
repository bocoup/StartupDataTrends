(function(U) {
  
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

  }

})(ALT.module("utils"));