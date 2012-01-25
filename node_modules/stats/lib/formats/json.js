
/*!
 * stats - formats - json
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Output `stats` as JSON.
 *
 * @param {Object} stats
 * @api private
 */

module.exports = function(stats){
  process.stdout.write(JSON.stringify(stats));
};