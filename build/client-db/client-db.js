'use strict';

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLodash = require('../lib/lodash');

var _ = _interopRequireWildcard(_libLodash);

var _collection = require('./collection');

function ClientDb() {
    this.collections = {};
}

ClientDb.prototype.addCollection = function (name, options) {
    this.collections[name] = new _collection.Collection(name, options);
};

ClientDb.prototype.removeCollection = function (name) {
    delete this.collections[name];
};

ClientDb.prototype.empty = function () {
    _.forEach(this.collections, function (collection) {
        collection.empty();
    });
};

exports.ClientDb = ClientDb;