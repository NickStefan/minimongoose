'use strict';

exports.__esModule = true;

var _clientDbClientDb = require('./client-db/client-db');

var _model = require('./model');

var _schema = require('./schema');

function MiniMongoose(options) {
    options = options || {};

    this.resourcePrefix = options.resourcePrefix || "";
    this.backendOrmMediator = options.backendOrmMediator;
    this.db = new _clientDbClientDb.ClientDb();
    this.models = {};
}

MiniMongoose.Schema = _schema.Schema;

// add the model schemas
MiniMongoose.prototype.model = function (modelName, schema, options) {
    var self = this;
    // create a queryable model object
    var model = new _model.Model(self, this.db, modelName, schema, options);
    // expose the query builder
    this.models[modelName] = model;
    return model;
};

MiniMongoose.prototype.empty = function () {
    this.db.empty();
};

// add models to cache
// this should be a method on a model. not on minimongoose
// !for testing only!
MiniMongoose.prototype.addToCache = function addToCache(collectionName, docOrDocs) {
    this.db.collections[collectionName].seed(docOrDocs);
    return this;
};

exports.MiniMongoose = MiniMongoose;