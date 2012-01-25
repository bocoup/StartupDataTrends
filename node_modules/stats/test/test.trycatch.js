
/**
 * Module dependencies.
 */

var stats = require('../')
  , common = require('./common');

var stats = stats.parse('try { "test" } catch (err) { "testing" }');
stats.should.have.property('statements', 3);
stats.should.have.property('strings', 2);
