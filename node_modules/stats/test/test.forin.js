
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse('for (var key in val) "hey";');
stats.should.have.property('statements', 2);
stats.should.have.property('strings', 1);
