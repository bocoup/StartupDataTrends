
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse(fixture('with.js'));
stats.should.have.property('statements', 3);
