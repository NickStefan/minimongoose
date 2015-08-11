var _ = require('underscore');

var minimongo = require('minimongo');
var Model = require('./model').Model;

function MiniMongoose (){
    this.db = new minimongo.MemoryDb();
    this.models = {};
}

// add the model schemas
MiniMongoose.prototype.model = function(modelName, schema) {
    // create a queryable model object
    var model = new Model(this, this.db, modelName, schema);
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