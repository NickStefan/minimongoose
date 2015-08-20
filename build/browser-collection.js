'use strict';

/**
 * Module dependencies
 */

/**
 * allow mquery to support a browser based collection class
 */

exports.__esModule = true;
function BrowserCollection(collection) {
  this.collection = collection;
  this.collectionName = collection.collectionName;
}

/**
 * find(match, options, function(err, docs))
 * mongo returns a cursor, we instead return the actual results
 */

BrowserCollection.prototype.find = function (match, options, cb) {
  this.collection.find(match, options, cb);
};

/**
 * findOne(match, options, function(err, doc))
 */

BrowserCollection.prototype.findOne = function (match, options, cb) {
  this.collection.findOne(match, options, cb);
};

/**
 * count(match, options, function(err, count))
 */

BrowserCollection.prototype.count = function (match, options, cb) {
  this.collection.count(match, options, cb);
};

/**
 * distinct(prop, match, options, function(err, count))
 * TODO
 */

BrowserCollection.prototype.distinct = function (prop, match, options, cb) {
  this.collection.distinct(prop, match, options, cb);
};

/**
 * update(match, update, options, function(err[, result]))
 * TODO
 * the update param will probably only takes {bob: 'newName'} syntax
 * update param does not support { $set: {'bob': 'newName'}} syntax
 */

BrowserCollection.prototype.update = function (match, update, options, cb) {
  this.collection.update(match, update, options, cb);
};

/**
 * remove(match, options, function(err[, result])
 */

BrowserCollection.prototype.remove = function (match, options, cb) {
  this.collection.remove(match, options, cb);
};

/**
 * findAndModify(match, update, options, function(err, doc))
 * TODO
 */

BrowserCollection.prototype.findAndModify = function (match, update, options, cb) {
  this.collection.findAndModify(match, update, options, cb);
};

/**
 * var stream = findStream(match, findOptions, streamOptions)
 * TODO
 */

BrowserCollection.prototype.findStream = function (match, findOptions, streamOptions) {
  return this.collection.findStream(match, findOptions).stream(streamOptions);
};

/**
 * aggregation(operators..., function(err, doc))
 * TODO
 */

/**
 * Expose
 */

exports.BrowserCollection = BrowserCollection;