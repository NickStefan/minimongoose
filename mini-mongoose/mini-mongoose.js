var _ = require('underscore');

var minimongo = require('minimongo');
var Model = require('./model').Model;

function MiniMongoose (url){
    if (url){
        this.localDb = new minimongo.MemoryDb();
        this.remoteDb = new minimongo.RemoteDb(url);
        this.db = new minimongo.HybridDb(this.localDb, this.remoteDb);
    } else {
        this.db = new minimongo.MemoryDb();
    }

    this.models = {};
}

// add the model schemas
MiniMongoose.prototype.model = function(modelName, schema) {
    // create a queryable model object
    var minimongoose = this;
    var model = new Model(minimongoose, this.db, modelName, schema);
    // expose the query builder
    this.models[modelName] = model;
    return model;
};

// we dont use the minimongo 'seed' function,
// because it only seeds doc's that arent in the upsert or remove collections
// we want to be able to just overwrite stuff ...for now.

// add models to cache and expose query builder
MiniMongoose.prototype.addToCache = function addToCache(collectionName, doc){
    if (!doc._id){
        // Need a mongoId
        return this;
    }
    this.db[collectionName].items[doc._id] = doc;
    return this;
}

module.exports = {
    MiniMongoose: MiniMongoose
};