
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse(fixture('http.js'));
stats.should.have.property('strings', 4);
stats.should.have.property('numbers', 1);
stats.should.have.property('statements', 4);
stats.should.have.property('assignments', 1);
stats.should.have.property('stringBytes', 38);
stats.should.have.property('loc', 11);
