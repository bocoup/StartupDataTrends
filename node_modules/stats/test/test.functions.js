
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse(fixture('functions.js'));
stats.should.have.property('statements', 10);
stats.should.have.property('assignments', 2);
stats.should.have.property('functions', 4);
