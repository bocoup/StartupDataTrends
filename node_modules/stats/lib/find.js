
/*!
 * stats - find
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , join = path.join
  , extname = path.extname
  , noop = function(){};

/**
 * Find JavaScript files by the given `paths`
 * and callback `fn(err, files)`.
 *
 * @param {Array} paths
 * @param {Function} fn
 * @api public
 */

module.exports = function(paths, fn){
  var pending = paths.length
    , ret = [];

  function find(path) {
    fs.stat(path, function(err, stat) {
      if (err) {
        fn(err);
        fn = noop;
        return
      }
      
      if (stat.isFile() && isJavaScript(path)) {
        ret.push(path);
        --pending || fn(null, ret);
      } else {
        fs.readdir(path, function(err, files){
          if (err) {
            fn(err);
            fn = noop;
            return
          }

          files.forEach(function(file){
            file = join(path, file);
            if (isJavaScript(file)) {
              ret.push(file);
            } else {
              ++pending;
              fs.stat(file, function(err, stat){
                if (err) return;
                if (!stat.isDirectory()) return --pending || fn(null, ret);
                find(file);
              });
            }
          });

          --pending || fn(null, ret);
        });
      }
    });
  }

  paths.forEach(find);
};

/**
 * Filter `file` by ".js" extension.
 *
 * @param {String} file
 * @return {Boolean}
 * @api private
 */

function isJavaScript(file) {
  return '.js' == extname(file);
}