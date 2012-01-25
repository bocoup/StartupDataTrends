
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse(fixture('arrays.js'));
stats.should.have.property('arrayLiterals', 2);
stats.should.have.property('strings', 6);
