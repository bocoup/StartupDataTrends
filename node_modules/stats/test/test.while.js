
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse(fixture('while.js'));
stats.should.have.property('statements', 5);
