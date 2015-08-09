// MongooseQuery is about 900kb, and depends on mongoDB,
// would require either a pull request or an odd checkin
// Conversely, if we just used mQuery by itself, it'd be 300kb. 
// Is built in populate etc worth 600kb? not today...
// mini mongo is about 600kb, but that includes its own jQuery and lodash!
// could take that down to 300k? 
// 300mquery + 300mini mongo + 600mongoose schemas?

var MongooseQuery = require('../node_modules/mongoose/lib/query');
var minimongo = require('minimongo');

// make mongoose query builder work with mini mongo collections
// require a custom collection class
var Collection = require('./collection');

function MediumMongoose (){
    this.db = new minimongo.MemoryDb();
    this.models = {};
}

MediumMongoose.prototype.model = function(modelName, schema) {
    this.models[modelName] = {};
    this.models[modelName].schema = schema
};

// we dont use the minimongo 'seed' function,
// because it only seeds doc's that arent in the upsert or remove collections
// we want to be able to just overwrite stuff ...for now.

// add models to cache and expose query builder   
MediumMongoose.prototype.addToCache = function addToCache(collection, id, doc){
    if (!this.db[collection]){
        this.db.addCollection(collection);
        // mquery requires collections to impliment insert, remove and update
        this.db[collection].update = function(){};
        // expose the query builder
        this[collection] = new MongooseQuery({}, {}, this.models[collection], this.db[collection]);
        this[collection].Collection = Collection;
    }
    this.db[collection].items[id] = doc;
    return this;
}

module.exports = {
    MediumMongoose: MediumMongoose
};