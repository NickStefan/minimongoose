import * as _ from '../lib/lodash';
import {EJSON} from './EJSON';

function FlightManager (){
	this.queries = {};
    this.flights = {};
}

FlightManager.prototype.stringifyQuery = function(match, options){
    var query = _.chain(match)
                .keys()
                .sort()
                .map(function(keyString){
                    return [keyString, match[keyString]];
                })
                .value();
    return EJSON.stringify(query);
}

FlightManager.prototype.addFlightCallback = function(qry, cb){
	if (!this.flights[qry]){
		this.flights[qry] = {
			callbacks: []
		};
	}
    this.flights[qry].callbacks.push(cb);
};

FlightManager.prototype.previousFlight = function(qry){
    return _.has(this.queries, qry);
};

FlightManager.prototype.inFlight = function(qry){
    return _.has(this.flights, qry);
};

FlightManager.prototype.resolveFlight = function(qry){
    _.forEach(this.flights[qry].callbacks, function(cb){
        cb();
    });
    this.queries[qry] = true;
};

export {FlightManager};