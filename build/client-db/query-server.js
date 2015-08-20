'use strict';

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLodash = require('../lib/lodash');

var _ = _interopRequireWildcard(_libLodash);

var _jquery = require('jquery');

var request = _interopRequireWildcard(_jquery);

var _EJSON = require('./EJSON');

function prepareParams(match, options) {
    match = match || {};
    options = options || {};

    var params = {
        match: _EJSON.EJSON.stringify(match)
    };

    if (options.modelName) {
        params.modelName = options.modelName;
    }
    if (options.operation) {
        params.operation = options.operation;
    }
    if (options.sort) {
        params.sort = _EJSON.EJSON.stringify(options.sort);
    }
    if (options.limit) {
        params.limit = options.limit;
    }
    if (options.skip) {
        params.skip = options.skip;
    }
    if (options.fields) {
        params.fields = _EJSON.EJSON.stringify(options.fields);
    }

    return params;
}

function http(verb, params, url) {
    return request[verb]({
        url: url,
        dataType: 'json',
        data: params
    });
}

function queryServer(collection, match, options, cb) {
    options.modelName = collection.collectionName;
    options.operation = 'find';

    // if node
    if (collection.model.backendOrmMediator) {
        for (var k in options) {
            if (typeof options[k] == 'undefined') {
                delete options[k];
            }
        }
        collection.model.backendOrmMediator(match, options, cb);

        // browser
    } else {
            var params = prepareParams(match, options);

            http('post', params, collection.model.resource).done(function (results) {
                cb(null, results);
            });
        }
}

exports.queryServer = queryServer;