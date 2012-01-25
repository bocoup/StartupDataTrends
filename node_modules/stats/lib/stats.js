
/*!
 * stats
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Library version.
 */

exports.version = '0.0.6';

/**
 * Return stats for the given javascript `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = require('./parser');

/**
 * Find JavaScript files by the given `paths`
 * and callback `fn(err, files)`.
 *
 * @param {Array} paths
 * @param {Function} fn
 * @api public
 */

exports.find = require('./find');

/**
 * Expose formatters.
 */

exports.formats = require('./formats');