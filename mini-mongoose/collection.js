'use strict';

/**
 * Module dependencies
 */

var _ = require('underscore');

/**
 * mini mongo doesnt support err, results callback style
 * but we'll make it!
 */

function MnMCollection (col) {
    // col should be a minimongo collection
    this.collection = col;
    this.collectionName = col.name;
}


/**
 * find(match, options, function(err, docs))
 * mini-mongo returns a cursor for it's find method
 * we instead return the cursors actual results
 */

MnMCollection.prototype.find = function (match, options, cb) {
    this.collection
    .find(match, options)
    .fetch(function(results) {
        if (results) {
            return cb(null, results);
        }
    });
}

/**
 * findOne(match, options, function(err, doc))
 */

MnMCollection.prototype.findOne = function (match, options, cb) {
    this.find(match, options, function(err, results){
        if (results && results[0]) {
            return cb(null, results[0]);
        }
    });
}

/**
 * count(match, options, function(err, count))
 */

MnMCollection.prototype.count = function (match, options, cb) {
    this.find(match, options, function(err, results){
        if (results) {
            return cb(null, results.length);
        }
    });
}

/**
 * distinct(prop, match, options, function(err, count))
 * TODO
 */

MnMCollection.prototype.distinct  = function (prop, match, options, cb) {
    this.collection.distinct(prop, match, options, cb);
}

/**
 * update(match, update, options, function(err[, result]))
 * mini-mongo doesnt have "update"
 * we instead do a find + upsert
 * the update param only takes {bob: 'newName'} syntax
 * update param does not support { $set: {'bob': 'newName'}} syntax
 */

MnMCollection.prototype.update = function (match, update, options, cb) {
    var self = this;

    this.find(match, options, function(err, results){
        if (results) {
            var updated = _.map(results, function(doc){
                return _.extend(doc, update);
            });

            // THIS IS A TRUE UPSERT, AN OVERWRITE, NOT A PATCH
            self.collection.upsert(updated, function(){
                // mongoose returns a raw mongo response, not docs
                cb(null, true);
            });
        }
    }, error);
}

/**
 * remove(match, options, function(err[, result])
 * DOES NOT SUPPORT OPTIONS YET
 */

MnMCollection.prototype.remove = function (match, options, cb) {
    var self = this;
    this.find(match, options, function(err, results){
        _.forEach(results, function(doc){
            self.collection.remove(doc.id);
        });
        cb(null, true);
    });
    this.collection.remove(match, options, cb);
}

/**
 * findAndModify(match, update, options, function(err, doc))
 * TODO
 */

MnMCollection.prototype.findAndModify = function (match, update, options, cb) {
    var sort = Array.isArray(options.sort) ? options.sort : [];
    this.collection.findAndModify(match, sort, update, options, cb);
}

/**
 * var stream = findStream(match, findOptions, streamOptions)
 * TODO
 */

MnMCollection.prototype.findStream = function(match, findOptions, streamOptions) {
    return this.collection.find(match, findOptions).stream(streamOptions);
}

/**
 * aggregation(operators..., function(err, doc))
 * TODO
 */

/**
 * Expose
 */

module.exports = MnMCollection;