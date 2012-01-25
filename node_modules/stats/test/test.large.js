
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse(fixture('large.js'));
stats.should.have.property('statements', 16);
stats.should.have.property('assignments', 9);
stats.should.have.property('loc', 65);
stats.should.have.property('objectLiterals', 1);
stats.should.have.property('objectsCreated', 1);
stats.should.have.property('throws', 1);
