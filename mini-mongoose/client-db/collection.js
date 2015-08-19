var _ = require('../lib/lodash');

var queryServer = require('./query-server').queryServer;
var finder = require('./engine').finder;
var seeder = require('./engine').seeder;
var remover = require('./engine').remover;
var items = require('./engine').items;
var FlightManager = require('./flight-manager').FlightManager;

function Collection(name, model, options) {
    this.collectionName = name;
    this.items = items();
    this.flightManager = new FlightManager();
    this.model = model;
}

Collection.prototype.find = function(match, options, cb){
    var self = this;
    var qry = this.flightManager.stringifyQuery(match, options);
    var callback = function(){
        cb(null, finder(self.items, match, options));
    };

    if (this.flightManager.previousFlight(qry)){
        callback();

    } else if (this.flightManager.inFlight(qry)){
        this.flightManager.addFlightCallback(qry, callback);

    } else {
        this.flightManager.addFlightCallback(qry, callback);
        queryServer(self, match, options, function(err, results){
            // should add a check for modelName here
            if (results.results) {
                self.seed(results.results);
            }
            self.flightManager.resolveFlight(qry);
        });
    }
};

Collection.prototype.populateHash = function(match, options, cb){
    var self = this;
    var ids = match._id.$in;
    var qry = this.flightManager.stringifyQuery(match, options);
    var callback = function(){
        cb(null, populateHashFinder(self.items, match, options));
    };

    if (this.flightManager.previousFlight(qry)){
        callback();

    } else if (this.flightManager.inFlight(qry)){
        this.flightManager.addFlightCallback(qry, callback);

    } else {
        // clone match._id.$in
        // iterate ids in this.items,
        // if there, clonedMatch._id.$in.pop()
        // if clonedMatch.length, queryServer
        // else callback()

        this.flightManager.addFlightCallback(qry, callback);
        queryServer(self, match, options, function(err, results){
            // should add a check for modelName here
            if (results.results) {
                self.seed(results.results);
            }
            self.flightManager.resolveFlight(qry);
        });
    }
};

Collection.prototype.seed = function(docs) {
    this.items = seeder(this.items, docs);
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
        remover(self, self.items, results);
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