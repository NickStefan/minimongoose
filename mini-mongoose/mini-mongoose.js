var clientDb = require('./client-db/client-db');
var Model = require('./model').Model;
var Schema = require('./schema').Schema;

function MiniMongoose (options){
    options = options || {};

    this.backendOrmMediator = options.backendOrmMediator;
    this.db = new clientDb.ClientDb();
    this.models = {};
}

MiniMongoose.Schema = Schema;

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
    this.db.collections[collectionName].seed(docOrDocs);
    return this;
};

module.exports = {
    MiniMongoose: MiniMongoose
};