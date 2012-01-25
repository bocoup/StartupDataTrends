
/**
 * Module dependencies.
 */

var should = require('should')
  , fs = require('fs');

// load fixture path

global.fixture = function fixture(path) {
  return fs.readFileSync(__dirname + '/fixtures/' + path, 'utf8');
};