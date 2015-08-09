var minimongo = require('minimongo');
var mquery = require('mquery');

// make mongoose query builder work with mini mongo collections
// require a custom collection class
mquery.Collection = require('./collection');
// mongoose makes a query wrapper that has populate, options etc
// and then inherits the mquery class. we're going a little light weight here...
mquery.populate = require('./populate').populate;
mquery._MnMOptions = {};

function MiniMongoose (){
    this.db = new minimongo.MemoryDb();
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
MiniMongoose.prototype.addToCache = function addToCache(collectionName, id, doc){
    if (!this.db[collectionName]){
        this.db.addCollection(collectionName);
        // mquery requires collections to impliment insert, remove and update
        this.db[collectionName].update = function(){};
        // expose the query builder
        this[collectionName] = mquery(this.db[collectionName]);
    }
    this.db[collectionName].items[id] = doc;
    return this;
}
    
module.exports = {
    MiniMongoose: MiniMongoose
};