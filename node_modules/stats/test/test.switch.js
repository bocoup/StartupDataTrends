
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse(fixture('switch.js'));
stats.should.have.property('statements', 5);
