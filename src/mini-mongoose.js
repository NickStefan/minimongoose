import {ClientDb} from './client-db/client-db';
import {Model} from './model';
import {Schema} from './schema';

function MiniMongoose (options){
    options = options || {};

    this.resourcePrefix = options.resourcePrefix || "";
    this.backendOrmMediator = options.backendOrmMediator;
    this.db = new ClientDb();
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

MiniMongoose.prototype.empty = function(){
    this.db.empty();
};

// add models to cache
// this should be a method on a model. not on minimongoose
// !for testing only!
MiniMongoose.prototype.addToCache = function addToCache(collectionName, docOrDocs){
    this.db.collections[collectionName].seed(docOrDocs);
    return this;
};

export default MiniMongoose;
export { MiniMongoose };