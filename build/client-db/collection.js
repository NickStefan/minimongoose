'use strict';

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLodash = require('../lib/lodash');

var _ = _interopRequireWildcard(_libLodash);

var _queryServer = require('./query-server');

var _engine = require('./engine');

var _flightManager = require('./flight-manager');

function Collection(name, model, options) {
    this.collectionName = name;
    this.items = _engine.items();
    this.flightManager = new _flightManager.FlightManager();
    this.model = model;
}

Collection.prototype.find = function (match, options, cb) {
    var self = this;
    var qry = this.flightManager.stringifyQuery(match, options);
    var callback = function callback() {
        cb(null, _engine.finder(self.items, match, options));
    };

    if (this.flightManager.previousFlight(qry)) {
        callback();
    } else if (this.flightManager.inFlight(qry)) {
        this.flightManager.addFlightCallback(qry, callback);
    } else {
        this.flightManager.addFlightCallback(qry, callback);
        _queryServer.queryServer(self, match, options, function (err, results) {
            // should add a check for modelName here
            if (results.results) {
                self.seed(results.results);
            }
            self.flightManager.resolveFlight(qry);
        });
    }
};

// big O optimization for {_id: {$in: ['2342143']}} type queries
// such as populate queries
Collection.prototype.populateHash = function (match, options, cb) {
    var self = this;
    var ids = match._id.$in;

    var qry = this.flightManager.stringifyQuery(match, options);
    var callback = function callback() {
        cb(null, _engine.populateHashFinder(self.items, match, options));
    };

    if (this.flightManager.previousFlight(qry)) {
        callback();
    } else if (this.flightManager.inFlight(qry)) {
        this.flightManager.addFlightCallback(qry, callback);
    } else {
        var clonedMatch = _.cloneDeep(match);
        _.forEachRight(ids, function (id) {
            if (_engine.checker(self.items, id)) {
                clonedMatch._id.$in.pop();
            }
        });
        if (clonedMatch._id.$in.length) {
            this.flightManager.addFlightCallback(qry, callback);
            _queryServer.queryServer(self, clonedMatch, options, function (err, results) {
                // should add a check for modelName here
                if (results.results) {
                    self.seed(results.results);
                }
                self.flightManager.resolveFlight(qry);
            });
        } else {
            callback();
        }
    }
};

Collection.prototype.seed = function (docs) {
    this.items = _engine.seeder(this.items, docs);
};

Collection.prototype.empty = function () {
    this.items = _engine.items();
    this.flightManager = new _flightManager.FlightManager();
};

Collection.prototype.findOne = function (match, options, cb) {
    // err, results
    this.find(match, options, function (err, results) {
        if (results && results[0]) {
            cb(null, results[0]);
        } else {
            cb(null, null);
        }
    });
};

Collection.prototype.findStream = function (match, findOptions, streamOptions) {
    // no op for now
};

Collection.prototype.count = function (match, options, cb) {
    this.find(match, options, function (err, results) {
        cb(null, results.length);
    });
};

Collection.prototype.distinct = function (prop, match, options, cb) {
    // no op for now
};

Collection.prototype.update = function (match, update, options, cb) {
    // no op for now
};

Collection.prototype.findAndModify = function (match, update, options, cb) {
    // no op for now
};

Collection.prototype.remove = function (match, options, cb) {
    var self = this;
    this.find(match, options, function (err, results) {
        _engine.remover(self.items, results);
        cb(null, results);
    });
};

Collection.prototype.aggregate = function () {
    // no op for now
};

Collection.prototype.insert = function () {
    // no op for now
};

exports.Collection = Collection;