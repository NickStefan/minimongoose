var _ = require('../lib/lodash');

var Collection = require('./collection').Collection;

function ClientDb() {
    this.collections = {};
}

ClientDb.prototype.addCollection = function(name, options) {
    this.collections[name] = new Collection(name, options);
};

ClientDb.prototype.removeCollection = function(name) {
    delete this.collections[name];
};

ClientDb.prototype.empty = function(){
	_.forEach(this.collections, function(collection){
		collection.empty();
	});
};

module.exports = {
    ClientDb: ClientDb,
}