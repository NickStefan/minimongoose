'use strict';

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLodash = require('../lib/lodash');

var _ = _interopRequireWildcard(_libLodash);

var _EJSON = require('./EJSON');

function FlightManager() {
    this.queries = {};
    this.flights = {};
}

FlightManager.prototype.stringifyQuery = function (match, options) {
    var query = _.chain(match).keys().sort().map(function (keyString) {
        return [keyString, match[keyString]];
    }).value();
    return _EJSON.EJSON.stringify(query);
};

FlightManager.prototype.addFlightCallback = function (qry, cb) {
    if (!this.flights[qry]) {
        this.flights[qry] = {
            callbacks: []
        };
    }
    this.flights[qry].callbacks.push(cb);
};

FlightManager.prototype.previousFlight = function (qry) {
    console.log(_.has(this.queries, qry));
    return _.has(this.queries, qry);
};

FlightManager.prototype.inFlight = function (qry) {
    return _.has(this.flights, qry);
};

FlightManager.prototype.resolveFlight = function (qry) {
    _.forEach(this.flights[qry].callbacks, function (cb) {
        cb();
    });
    this.queries[qry] = true;
};

exports.FlightManager = FlightManager;