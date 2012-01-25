
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse('("foo", "bar", "baz")');
stats.should.have.property('statements', 1);
stats.should.have.property('strings', 3);
