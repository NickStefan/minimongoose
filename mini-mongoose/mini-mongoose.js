var minimongo = require('minimongo');
var mquery = require('mquery');
var _ = require('underscore');

// make mongoose query builder work with mini mongo collections
// require a custom collection class
mquery.Collection = require('./collection');

// mongoose makes a query wrapper that has populate, options etc
// and then inherits the mquery class. we're going a little light weight here...
mquery.prototype.populate = require('./populate').populate;
mquery.prototype._minimongooseOptions = {};

function MiniMongoose (){
    this.db = new minimongo.MemoryDb();
    this.models = {};
}

// add the model schemas
MiniMongoose.prototype.model = function(modelName, schema) {
    this.models[modelName] = {};
    this.models[modelName].schema = schema;
};

// we dont use the minimongo 'seed' function,
// because it only seeds doc's that arent in the upsert or remove collections
// we want to be able to just overwrite stuff ...for now.

// add models to cache and expose query builder   
MiniMongoose.prototype.addToCache = function addToCache(collectionName, doc){

    if (!this.db[collectionName]){
        this.db.addCollection(collectionName);
        // mquery requires collections to impliment insert, remove and update
        this.db[collectionName].update = function(){};
        // expose the query builder
        this.db[collectionName].model = this.models[collectionName];
        this[collectionName] = mquery(this.db[collectionName]);
    }
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