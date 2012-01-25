#!/usr/bin/env node

/**
 * Module dependencies.
 */

var stats = require('../')
  , program = require('commander')
  , fs = require('fs');

/**
 * Statistics.
 */

var statistics = {};

/**
 * Options.
 */

program
  .version(stats.version)
  .option('-f, --format <name>', 'output the given format. text or json. [text]', 'text')
  .option('-j, --json', 'output json stats')
  .option('-t, --text', 'output human-readable text stats')
  .option('-T, --totals', 'output totals only')
  .parse(process.argv);

// format shortcuts

if (program.text) program.format = 'text';
if (program.json) program.format = 'json';

// paths

var paths = program.args;

// process

var totals = {};
stats.find(paths, function(err, files){
  if (err) throw err;
  var pending = files.length;
  files.forEach(function(file){
    fs.readFile(file, 'utf8', function(err, str){
      if (err) throw err;
      statistics[file] = stats.parse(str, program);
      Object.keys(statistics[file]).forEach(function(key){
        totals[key] = (totals[key] || 0) + statistics[file][key];
      });
      --pending || done();
    });
  });
});

// finished

function done() {
  if (program.text) {}
  var format = stats.formats[program.format];
  if (!format) throw new Error('invalid format "' + program.format + '"');
  var obj = { totals: totals };
  totals.files = Object.keys(statistics).length;
  if (!program.totals) {
    for (var file in statistics) obj[file] = statistics[file];
  }
  format(obj);
}
