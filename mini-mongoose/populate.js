var _ = require('underscore');

module.exports = {
    populate: populate,
    __populate: __populate
};

// 95% from mongoose (utils.isObject -> _.isObject)
function populate (){
    var res = __populate.apply(null, arguments);
    var opts = this._mongooseOptions;

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
                return __populate(o)[0];
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
