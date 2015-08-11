var Query = require('./query');
var __populate = require('./populate').__populate;
var Promise = Query.prototype.Promise;

function Model(collection, schema, modelGetter){
    this.collection = collection;
    this.modelName = collection.name;
    this.schema = schema;
    this.getOtherModels = modelGetter;
}

// placeholder
Model.prototype.init = function(){

}

Model.prototype._getSchema = function(){
    return this.schema;
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
// Model.prototype.populate = function(docs, pop, callback){
//     console.log('populated!')
//     callback(null, docs);
// };

Model.prototype.populate = function (docs, paths, cb) {
    debugger
  var promise = new Promise(cb);

  // always resolve on nextTick for consistent async behavior
  function resolve () {
    var args = Array.prototype.slice.call(arguments);
    process.nextTick(function () {
      promise.resolve.apply(promise, args);
    });
  }

  // normalized paths
  var paths = __populate(paths);
  var pending = paths.length;

  if (0 === pending) {
    resolve(null, docs);
    return promise;
  }

  // each path has its own query options and must be executed separately
  var i = pending;
  var path;
  var model = this;
  while (i--) {
    path = paths[i];
    if ('function' === typeof path.model) model = path.model;
    populate(model, docs, path, subPopulate.call(model, docs, path, next));
  }

  return promise;

  function next (err) {
    if (err) return resolve(err);
    if (--pending) return;
    resolve(null, docs);
  }
}

/*!
 * Populates deeply if `populate` option is present.
 *
 * @param {Document|Array} docs
 * @param {Object} options
 * @param {Function} cb
 * @return {Function}
 * @api private
 */
function subPopulate (docs, options, cb) {
  var model = this;
  var prefix = options.path+'.';
  var pop = options.populate;

  if (!pop) {
    return cb;
  }

  // normalize as array
  if (!Array.isArray(pop)) {
    pop = [pop];
  }

  return function (err) {
    var pending = pop.length;

    function next (err) {
      if (err) return cb(err);
      if (--pending) return;
      cb();
    }

    if (err || !pending) return cb(err);

    pop.forEach(function (subOptions) {
      // path needs parent's path prefixed to it
      if (!subOptions._originalPath) {
        subOptions._originalPath = subOptions.path;
        subOptions.path = prefix+subOptions.path;
      }
      if (typeof subOptions.model === 'string') {
        subOptions.model = model.model(subOptions.model);
      }
      Model.populate.call(subOptions.model || model, docs, subOptions, next);
    });
  }
}

/*!
 * Populates `docs`
 */
var excludeIdReg = /\s?-_id\s?/,
  excludeIdRegGlobal = /\s?-_id\s?/g;

function populate(model, docs, options, cb) {
  var modelsMap, rawIds;

  // normalize single / multiple docs passed
  if (!Array.isArray(docs)) {
    docs = [docs];
  }

  if (0 === docs.length || docs.every(function (doc){return (doc === null) || (doc === undefined);})) {
    return cb();
  }

  modelsMap = getModelsMapForPopulate(model, docs, options);
  rawIds = getIdsForAndAddIdsInMapPopulate(modelsMap);

  var i, len = modelsMap.length,
    mod, match, select, promise, vals = [];

  promise = new Promise(function(err, vals, options, assignmentOpts) {
    if (err) return cb(err);

    var lean = options.options && options.options.lean,
      len = vals.length,
      rawOrder = {}, rawDocs = {}, key, val;

    // optimization:
    // record the document positions as returned by
    // the query result.
    for (var i = 0; i < len; i++) {
      val = vals[i];
      key = String(utils.getValue('_id', val));
      rawDocs[key] = val;
      rawOrder[key] = i;

      // flag each as result of population
      if (!lean) val.$__.wasPopulated = true;
    }

    assignVals({
      rawIds: rawIds,
      rawDocs: rawDocs,
      rawOrder: rawOrder,
      docs: docs,
      path: options.path,
      options: assignmentOpts
    });
    cb();
  });

  var _remaining = len;
  for (i = 0; i < len; i++) {
    mod = modelsMap[i];
    select = mod.options.select;

    if (mod.options.match) {
      match = utils.object.shallowCopy(mod.options.match);
    } else {
      match = {};
    }

    var ids = utils.array.flatten(mod.ids, function(item) {
      // no need to include undefined values in our query
      return undefined !== item;
    });

    ids = utils.array.unique(ids);

    if (0 === ids.length || ids.every(utils.isNullOrUndefined)) {
      return cb();
    }

    match._id || (match._id = {
      $in: ids
    });

    var assignmentOpts = {};
    assignmentOpts.sort = mod.options.options && mod.options.options.sort || undefined;
    assignmentOpts.excludeId = excludeIdReg.test(select) || (select && 0 === select._id);

    if (assignmentOpts.excludeId) {
      // override the exclusion from the query so we can use the _id
      // for document matching during assignment. we'll delete the
      // _id back off before returning the result.
      if ('string' == typeof select) {
        select = select.replace(excludeIdRegGlobal, ' ');
      } else {
        // preserve original select conditions by copying
        select = utils.object.shallowCopy(select);
        delete select._id;
      }
    }

    if (mod.options.options && mod.options.options.limit) {
      assignmentOpts.originalLimit = mod.options.options.limit;
      mod.options.options.limit = mod.options.options.limit * ids.length;
    }

    mod.Model.find(match, select, mod.options.options, next.bind(this, mod.options, assignmentOpts));
  }

  function next(options, assignmentOpts, err, valsFromDb) {
    if (err) return promise.resolve(err);
    vals = vals.concat(valsFromDb);
    if (--_remaining === 0) {
      promise.resolve(err, vals, options, assignmentOpts);
    }
  }
}

function getModelsMapForPopulate(model, docs, options) {
  var i, doc, len = docs.length,
    available = {},
    map = [],
    modelNameFromQuery = options.model && options.model.modelName || options.model,
    schema, refPath, Model, currentOptions, modelNames, modelName, discriminatorKey, modelForFindSchema;

  schema = model._getSchema(options.path);

  if(schema && schema.caster){
    schema = schema.caster;
  }

  if (!schema && model.discriminators){
    discriminatorKey = model.schema.discriminatorMapping.key
  }

  refPath = schema && schema.options && schema.options.refPath;

  for (i = 0; i < len; i++) {
    doc = docs[i];

    if(refPath){
      modelNames = utils.getValue(refPath, doc);
    }else{
      if(!modelNameFromQuery){
        var schemaForCurrentDoc;

        if(!schema && discriminatorKey){
          modelForFindSchema = utils.getValue(discriminatorKey, doc);

          if(modelForFindSchema){
            schemaForCurrentDoc = model.db.model(modelForFindSchema)._getSchema(options.path);

            if(schemaForCurrentDoc && schemaForCurrentDoc.caster){
              schemaForCurrentDoc = schemaForCurrentDoc.caster;
            }
          }
        } else {
          schemaForCurrentDoc = schema;
        }

        modelNames = [
          schemaForCurrentDoc && schemaForCurrentDoc.options && schemaForCurrentDoc.options.ref            // declared in schema
          || model.modelName                                           // an ad-hoc structure
        ]
      }else{
        modelNames = [modelNameFromQuery];  // query options
      }
    }

    if (!modelNames)
      continue;

    if (!Array.isArray(modelNames)) {
      modelNames = [modelNames];
    }

    var k = modelNames.length;
    while (k--) {
      modelName = modelNames[k];
      if (!available[modelName]) {
        Model = model.db.model(modelName);
        currentOptions = {
          model: Model
        };

        if(schema && !discriminatorKey){
          options.model = Model;
        }

        utils.merge(currentOptions, options);

        available[modelName] = {
          Model: Model,
          options: currentOptions,
          docs: [doc],
          ids: []
        };
        map.push(available[modelName]);
      } else {
        available[modelName].docs.push(doc);
      }

    }
  }

  return map;
}

function getIdsForAndAddIdsInMapPopulate(modelsMap) {
  var rawIds = [] // for the correct position
    ,
    i, j, doc, docs, id, len, len2, ret, isDocument, populated, options, path;

  len2 = modelsMap.length;
  for (j = 0; j < len2; j++) {
    docs = modelsMap[j].docs;
    len = docs.length;
    options = modelsMap[j].options;
    path = options.path;

    for (i = 0; i < len; i++) {
      ret = undefined;
      doc = docs[i];
      id = String(utils.getValue("_id", doc));
      isDocument = !! doc.$__;

      if (!ret || Array.isArray(ret) && 0 === ret.length) {
        ret = utils.getValue(path, doc);
      }

      if (ret) {
        ret = convertTo_id(ret);

        options._docs[id] = Array.isArray(ret) ? ret.slice() : ret;
      }

      rawIds.push(ret);
      modelsMap[j].ids.push(ret);

      if (isDocument) {
        // cache original populated _ids and model used
        doc.populated(path, options._docs[id], options);
      }
    }
  }

  return rawIds;
}

module.exports = {
    Model: Model
};