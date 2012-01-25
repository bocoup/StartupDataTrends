
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse(fixture('objects.js'));
stats.should.have.property('objectLiterals', 2);
stats.should.have.property('objectsCreated', 1);
