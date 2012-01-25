
/*!
 * jss
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var parse = require('uglify-js').parser.parse;

/**
 * Library version.
 */

exports.version = '0.0.1';

/**
 * Return stats for the given javascript `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.stats = function(str){
  var stats = {
      statements: 0
    , assignments: 0
    , functions: 0
    , numbers: 0
    , strings: 0
    , stringBytes: 0
    , loc: str.split('\n').length
    , bytes: Buffer.byteLength(str)
  };

  function visit(node) {
    if (!node) return;
    var name = node[0];

    // array support
    if ('string' != typeof name) {
      for (var i = 0, len = node.length; i < len; ++i) {
        visit(node[i]);
      }
      return;
    }

    // rename "name" to "ident"
    if ('name' == name) name = 'ident';

    // visit the node
    if (!visit[name]) throw new Error('no visitor implemented for "' + name + '"');
    visit[name](node);
  }

  visit['toplevel'] = function(node){
    visit(node[1]);
  };

  return stats;
};