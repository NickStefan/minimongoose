var _ = require('../lib/lodash');

var queryServer = require('./query-server').queryServer;
var finderEngine = require('./finder-engine').finderEngine;
var FlightManager = require('./flight-manager').FlightManager;

function Collection(name, model, options) {
    this.collectionName = name;
    this.items = {};
    this.flightManager = new FlightManager();
    this.model = model;
}

Collection.prototype.find = function(match, options, cb){
    var self = this;
    var qry = this.flightManager.stringifyQuery(match, options);
    var callback = function(){
        cb(null, finderEngine(self.items, match, options));
    };

    if (this.flightManager.previousFlight(qry)){
        callback();

    } else if (this.flightManager.inFlight(qry)){
        this.flightManager.addFlightCallback(qry, callback);

    } else {
        this.flightManager.addFlightCallback(qry, callback);
        queryServer(self, match, options, function(err, results){
            // should add a check for modelName here
            self.seed(results.results);
            self.flightManager.resolveFlight(qry);
        });
    }
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
    cb && cb(null, docs);
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

module.exports = {
    Collection: Collection
};