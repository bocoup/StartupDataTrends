
/*!
 * stats - formats - text
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Output `stats` as plain-text.
 *
 * @param {Object} stats
 * @api private
 */

exports = module.exports = function(files){
  Object.keys(files).forEach(function(file){
    var stats = files[file];
    console.log('\n  \033[90m%s:\033[0m', file);
    Object.keys(stats).forEach(function(name){
      var val = stats[name];
      if (exports[name]) val = exports[name](val);
      console.log('    \033[90m%s: \033[36m%s\033[0m', name, val);
    });
  });
  console.log();
};

/**
 * Format bytes.
 */

exports.bytes = 
exports.stringBytes = function(n){
  var kb = 1024
    , mb = kb * 1024;
  if (n < kb) return n + ' bytes';
  if (n < mb) return (n / kb).toFixed(2) + ' kb';
  return (n / mb).toFixed(2) + ' mb';
};
