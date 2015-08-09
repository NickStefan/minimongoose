var _ = require('underscore');

module.exports = {
    populate: populate,
    populateCallback: populateCallback
};

// 95% from mongoose (utils.isObject -> _.isObject)
function populate (){
    var res = __populate.apply(null, arguments);
    var opts = this._minimongooseOptions;

    if (!_.isObject(opts.populate)) {
        opts.populate = {};
    }

    for (var i = 0; i < res.length; ++i) {
        opts.populate[res[i].path] = res[i];
    }

    return this;
};


// 95% from mongoose (utils.isObject -> _.isObject)
function __populate (path, select, model, match, options, subPopulate) {
    // The order of select/conditions args is opposite Model.find but
    // necessary to keep backward compatibility (select could be
    // an array, string, or object literal).

    // might have passed an object specifying all arguments
    if (1 === arguments.length) {
        if (path instanceof PopulateOptions) {
            return [path];
        }

        if (Array.isArray(path)) {
            return path.map(function(o){
                return exports.populate(o)[0];
            });
        }

        if (_.isObject(path)) {
            match = path.match;
            options = path.options;
            select = path.select;
            model = path.model;
            subPopulate = path.populate;
            path = path.path;
        }
    } else if ('string' !== typeof model && 'function' !== typeof model) {
        options = match;
        match = model;
        model = undefined;
    }

    if ('string' != typeof path) {
        throw new TypeError('__populate: invalid path. Expected string. Got typeof `' + typeof path + '`');
    }

    if (typeof subPopulate === 'object') {
        subPopulate = __populate(subPopulate);
    }

    var ret = [];
    var paths = path.split(' ');
    for (var i = 0; i < paths.length; ++i) {
        ret.push(new PopulateOptions(paths[i], select, match, options, model, subPopulate));
    }

    return ret;
}

// straight from mongoose
function PopulateOptions (path, select, match, options, model, subPopulate) {
    this.path = path;
    this.match = match;
    this.select = select;
    this.options = options;
    this.model = model;
    if (typeof subPopulate === 'object') {
        this.populate = subPopulate;
    }
    this._docs = {};
}


// 95% from mongoose (utils.values -> _.values)
function preparePopulationOptionsMQ (query, options) {
    var pop = _.values(query._minimongooseOptions.populate);

    // lean options should trickle through all queries
    if (options.lean) pop.forEach(makeLean);

    return pop;
}

// 80% from mongoose
// this goes in the _find callback of the custom collection implimentation

function populateCallback(err, docs, self, callback) {
    if (err) {
        return callback(err);
    }

    if (docs.length === 0) {
        return callback(null, docs);
    }

    if (!options.populate) {
        return true === options.lean
        ? callback(null, docs)
        : this._completeMany(self.model, docs, fields, self, null, callback);
    }

    if (!self.model) {
        // cant populate without models!
        return;
    }

    var pop = preparePopulationOptionsMQ(self, options);
    self.model.populate(docs, pop, function (err, docs) {
        if(err) return callback(err);
        return true === options.lean
        ? callback(null, docs)
        : self._completeMany(self.model, docs, fields, self, pop, callback);
    });
};
