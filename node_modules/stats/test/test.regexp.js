
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse('foo.text(/something/)');
stats.should.have.property('statements', 1);
stats.should.have.property('regexpLiterals', 1);
