var clientDb = require('./client-db/client-db');
var Model = require('./model').Model;

function MiniMongoose (url){
    this.db = new clientDb.ClientDb();
    this.models = {};
}

// add the model schemas
MiniMongoose.prototype.model = function(modelName, schema, options) {
    var self = this;
    // create a queryable model object
    var model = new Model(self, this.db, modelName, schema, options);
    // expose the query builder
    this.models[modelName] = model;
    return model;
};

// add models to cache
// this should be a method on a model. not on minimongoose
MiniMongoose.prototype.addToCache = function addToCache(collectionName, docOrDocs){
    // if (!doc._id){
    //     // Need a mongoId
    //     return this;
    // }
    this.db.collections[collectionName].seed(docOrDocs);
    return this;
}

module.exports = {
    MiniMongoose: MiniMongoose
};