
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

module.exports = {
    ClientDb: ClientDb,
}