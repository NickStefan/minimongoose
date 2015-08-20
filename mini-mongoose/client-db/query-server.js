import * as _ from '../lib/lodash';
import * as request from 'jquery';

import {EJSON} from './EJSON';

function prepareParams(match, options){
    match = match || {};
    options = options || {};

    var params = {
        match: EJSON.stringify(match)
    };

    if (options.modelName){
        params.modelName = options.modelName;
    }
    if (options.operation){
        params.operation = options.operation;
    }
    if (options.sort) {
        params.sort = EJSON.stringify(options.sort);
    }
    if (options.limit) {
        params.limit = options.limit;
    }
    if (options.skip) {
        params.skip = options.skip;
    }
    if (options.fields) {
        params.fields = EJSON.stringify(options.fields);
    }

    return params;
}

function http(verb, params, url){
	return request[verb]({
        url: url,
        dataType: 'json',
        data: params
    });
}


function queryServer(collection, match, options, cb){
	options.modelName = collection.collectionName;
	options.operation = 'find';

    // if node
    if (collection.model.backendOrmMediator){
        for (var k in options) {
            if (typeof options[k] == 'undefined') {
                delete options[k];
            }
        }
        collection.model.backendOrmMediator(match, options, cb);

    // browser
    } else {
    	var params = prepareParams(match, options);

    	http('post', params, collection.model.resource)
        .done(function(results){
            cb(null, results);
        });
    }
}

export {queryServer};