var _ = require('../lib/lodash');

function prepareParams(match, options){
    match = match || {};
    options = options || {};

    var params = {
        match: JSON.stringify(match)
    };

    if (options.modelName){
        params.modelName = modelName;
    }
    if (options.operation){
        params.operation = options.operation;
    }
    if (options.sort) {
        params.sort = JSON.stringify(options.sort);
    }
    if (options.limit) {
        params.limit = options.limit;
    }
    if (options.skip) {
        params.skip = options.skip;
    }
    if (options.fields) {
        params.fields = JSON.stringify(options.fields);
    }

    return params;
}

// send HTTPverb, params, url through superagent or something

module.exports = {
    prepareParams: prepareParams
};
