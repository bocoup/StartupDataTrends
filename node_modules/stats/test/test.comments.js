
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse(fixture('comments.js'));
stats.should.have.property('statements', 0);
stats.should.have.property('loc', 8);
