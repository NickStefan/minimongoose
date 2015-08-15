var _ = require('../lib/lodash');
var finderEngine = require('./finder-engine').finderEngine;

function Collection(name, options) {
    this.collectionName = name;
    this.items = {};
}

Collection.prototype.find = function(match, options, cb){
	// err, results
	cb(null, finderEngine(this.items, match, options));
};

Collection.prototype.findOne = function(match, options, cb){
    // err, results
    this.find(match, options, function(err, results){
        if (results && results[0]) {
            cb(null, results[0]);
        } else {
            cb(null, null);
        }
    });
};

Collection.prototype.findStream = function(match, findOptions, streamOptions){
    // no op for now
};

Collection.prototype.count = function(match, options, cb){
    this.find(match, options, function(err, results){
        cb(null, results.length);
    });
};

Collection.prototype.distinct = function(prop, match, options, cb){
    // no op for now
};

Collection.prototype.update = function(match, update, options, cb){
    // no op for now
};

Collection.prototype.findAndModify = function(match, update, options, cb){
    // no op for now
};

Collection.prototype.remove = function(match, options, cb) {
	var self = this;
    this.find(match, options, function(err, results){
    	_.forEach(results, function(matched){
    		delete self.items[matched._id];
    	});
    	cb(null, results);
    });
};

Collection.prototype.aggregate = function(){
	// no op for now
};

Collection.prototype.insert = function(){
	// no op for now
};

Collection.prototype.seed = function(docs, cb) {
	var self = this;
    if (!_.isArray(docs)) {
        docs = [docs];
    }
    _.forEach(docs, function(doc){
    	if (_.has(doc, '_id')){
    		self.items[doc._id] = doc;
    	}
    });
    cb(null, docs);
};

module.exports = {
	Collection: Collection
};