
// make mongoose query builder work with mini mongo collections
// require a custom collection class
var mquery = require('mquery');
mquery.Collection = require('./collection');

// straight from mongoose
function Query(conditions, options, model, collection) {
    // this stuff is for dealing with custom queries created by #toConstructor
    if (!this._mongooseOptions) {
        this._mongooseOptions = {};
    }

    // this is the case where we have a CustomQuery, we need to check if we got
    // options passed in, and if we did, merge them in
    if (options) {
        var keys = Object.keys(options);
        for (var i=0; i < keys.length; i++) {
            var k = keys[i];
            this._mongooseOptions[k] = options[k];
        }
    }

    if (collection) {
        this.mongooseCollection = collection;
    }

    if (model) {
        this.model = model;
        this.schema = model.schema;
    }

    // this is needed because map reduce returns a model that can be queried, but
    // all of the queries on said model should be lean
    if (this.model && this.model._mapreduce) {
        this.lean();
    }

    // inherit mquery
    mquery.call(this, this.mongooseCollection, options);

    if (conditions) {
        this.find(conditions);
    }

    if (this.schema) {
        this._count = this.model.hooks.createWrapper('count', Query.prototype._count, this);
        this._execUpdate = this.model.hooks.createWrapper('update', Query.prototype._execUpdate, this);
        this._find = this.model.hooks.createWrapper('find', Query.prototype._find, this);
        this._findOne = this.model.hooks.createWrapper('findOne', Query.prototype._findOne, this);
        this._findOneAndRemove = this.model.hooks.createWrapper('findOneAndRemove', Query.prototype._findOneAndRemove, this);
        this._findOneAndUpdate = this.model.hooks.createWrapper('findOneAndUpdate', Query.prototype._findOneAndUpdate, this);
    }
}

/*!
 * inherit mquery
 */

Query.prototype = new mquery;
Query.prototype.constructor = Query;
Query.prototype.Promise = mquery.Promise;

Query.base = mquery.prototype;

Query.prototype.populate = require('./populate').populate;

// placeholder
Query.prototype.cast = function(){

}

// placeholder
Query.prototype._applyPaths = function(){

}

// placeholder
Query.prototype._castFields = function(){

}

// straight from mongoose
Query.prototype.lean = function (v) {
  this._mongooseOptions.lean = arguments.length ? !!v : true;
  return this;
}

// straight mongoose
Query.prototype._find = function(callback) {
  if (this._castError) {
    callback(this._castError);
    return this;
  }

  this._applyPaths();
  this._fields = this._castFields(this._fields);

  var fields = this._fieldsForExec();
  var options = this._mongooseOptions;
  var self = this;

  var cb = function(err, docs) {
    if (err) {
      return callback(err);
    }

    if (docs.length === 0) {
      return callback(null, docs);
    }

    if (!options.populate) {
      return true === options.lean
        ? callback(null, docs)
        : completeMany(self.model, docs, fields, self, null, callback);
    }

    var pop = preparePopulationOptionsMQ(self, options);
    self.model.populate(docs, pop, function (err, docs) {
      if(err) return callback(err);
      return true === options.lean
        ? callback(null, docs)
        : completeMany(self.model, docs, fields, self, pop, callback);
    });
  };

  return Query.base.find.call(this, {}, cb);
};


// straight mongoose
Query.prototype.find = function (conditions, callback) {
  var _this = this;

  if ('function' == typeof conditions) {
    callback = conditions;
    conditions = {};
  } else if (conditions instanceof Document) {
    conditions = conditions.toObject();
  }

  if (mquery.canMerge(conditions)) {
    this.merge(conditions);
  }

  prepareDiscriminatorCriteria(this);

  try {
    this.cast(this.model);
    this._castError = null;
  } catch (err) {
    this._castError = err;
  }

  // if we don't have a callback, then just return the query object
  if (!callback) {
    return Query.base.find.call(this);
  }

  this._find(callback);

  return this;
}

/* straight from mongoose!
 * hydrates many documents
 *
 * @param {Model} model
 * @param {Array} docs
 * @param {Object} fields
 * @param {Query} self
 * @param {Array} [pop] array of paths used in population
 * @param {Function} callback
 */

function completeMany (model, docs, fields, self, pop, callback) {
  var arr = [];
  var count = docs.length;
  var len = count;
  var opts = pop ?
    { populated: pop }
    : undefined;
  for (var i=0; i < len; ++i) {
    arr[i] = createModel(model, docs[i], fields);
    arr[i].init(docs[i], opts, function (err) {
      if (err) return callback(err);
      --count || callback(null, arr);
    });
  }
}

// a place holder function for now
function createModel(model, doc, fields){
    return doc;
}

// placeholder
function prepareDiscriminatorCriteria(){

}

// 95% from mongoose (utils.values -> _.values)
function preparePopulationOptionsMQ (query, options) {
    var pop = _.values(query._mongooseOptions.populate);

    // lean options should trickle through all queries
    if (options.lean) pop.forEach(makeLean);

    return pop;
}

// straight mongoose
function makeLean (option) {
  option.options || (option.options = {});
  option.options.lean = true;
}

module.exports = Query;