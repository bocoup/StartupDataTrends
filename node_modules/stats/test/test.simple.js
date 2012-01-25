
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

stats.should.have.property('version');

var stats = stats.parse(fixture('simple.js'));
stats.should.have.property('statements', 4);
stats.should.have.property('assignments', 4);
stats.should.have.property('loc', 9);
stats.should.have.property('bytes', 121);
