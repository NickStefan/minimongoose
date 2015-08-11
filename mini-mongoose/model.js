var Query = require('./query');

function Model(collection, schema){
    this.collection = collection;
    // this.schema = schema???
}

// placeholder
Model.prototype.init = function(){

}

// 95% mongoose
Model.prototype.find = function(conditions, projection, options, callback) {
    if ('function' == typeof conditions) {
        callback = conditions;
        conditions = {};
        projection = null;
        options = null;
    } else if ('function' == typeof projection) {
        callback = projection;
        projection = null;
        options = null;
    } else if ('function' == typeof options) {
        callback = options;
        options = null;
    }

    // get the minimongo collection object
    var mq = new Query({}, options, this, this.collection);

    // TODO
    // mq.select(projection);
    // if (this.schema.discriminatorMapping && mq.selectedInclusively()) {
    //     mq.select(this.schema.options.discriminatorKey);
    // }

    return mq.find(conditions, callback);
};

// 95% mongoose
Model.prototype.findById = function findById (id, projection, options, callback) {
    return this.findOne({ _id: id }, projection, options, callback);
};

// 95% mongoose
Model.prototype.findOne = function findOne (conditions, projection, options, callback) {
    if ('function' == typeof options) {
        callback = options;
        options = null;
    } else if ('function' == typeof projection) {
        callback = projection;
        projection = null;
        options = null;
    } else if ('function' == typeof conditions) {
        callback = conditions;
        conditions = {};
        projection = null;
        options = null;
    }

    // get the minimongo collection object
    var mq = new Query({}, options, this, this.collection);

    // TODO
    // mq.select(projection);
    // if (this.schema.discriminatorMapping && mq.selectedInclusively()) {
    //     mq.select(this.schema.options.discriminatorKey);
    // }

    return mq.findOne(conditions, callback);
};

// 100% mongoose
Model.prototype.count = function count (conditions, callback) {
    if ('function' === typeof conditions) callback = conditions, conditions = {};

    // get the minimongo collection object
    var mq = new Query({}, {}, this, this.collection);

    return mq.count(conditions, callback);
};

// 100% mongoose
Model.prototype.where = function where (path, val) {
    // get the minimongo collection object
    var mq = new Query({}, {}, this, this.collection).find({});
    return mq.where.apply(mq, arguments);
};

// Model.hydrate = function (obj) {
//   var model = require('./queryhelpers').createModel(this, obj);
//   model.init(obj);
//   return model;
// };

// TODO FIRST
Model.prototype.populate = function(docs, pop, callback){
    console.log('populated!')
    callback(null, docs);
};

module.exports = {
    Model: Model
};