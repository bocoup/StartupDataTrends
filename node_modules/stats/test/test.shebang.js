
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse(fixture('shebang.js'));
stats.should.have.property('statements', 3);
