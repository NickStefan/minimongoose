var _ = require('underscore');

var minimongo = require('minimongo');
var Model = require('./model').Model;

function MiniMongoose (){
    var self = this;
    this.db = new minimongo.MemoryDb();

    this.models = {};
    this.modelSchemas = {};
}

// add the model schemas
MiniMongoose.prototype.model = function(modelName, schema) {
    // for now, theyre equal, but should be modelName: Car, collectionName: Cars... capitals???
    var collectionName = modelName;

    // create mini mongo collection
    this.db.addCollection(collectionName);

    // mquery requires generic collections to impliment insert, remove and update
    this.db[collectionName].update = function(){};

    // create a queryable model object
    var model = new Model(this.db[collectionName]);

    // put the model (ie the schema, close to collections)
    this.db[collectionName].model = model;

    // expose the query builder
    this.models[modelName] = model;
    this.modelSchemas[modelName] = model.schema;

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