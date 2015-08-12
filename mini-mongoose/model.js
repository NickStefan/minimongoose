var _ = require('underscore');

var Query = require('./query');
var Promise = Query.prototype.Promise;
var parsePopulatePaths = require('./populate').parsePopulatePaths;

function Model(minimongoose, db, modelName, schema){
    this.minimongoose = minimongoose;

    this.modelName = modelName;
    this.collectionName = modelName; // for now, theyre equal, but should be modelName: Car, collectionName: Cars... capitals???

    // create mini mongo collection
    this.db = db;
    this.db.addCollection(this.collectionName);

    // mquery requires generic collections to impliment insert, remove and update
    this.db[this.collectionName].update = function(){ /*not implimented */ };
    this.collection = this.db[this.collectionName];

    this.schema = schema;
}

// placeholder
Model.prototype.init = function(){

}

Model.prototype._getSchema = function(path){
    var schema = this.schema;
    var pathschema = schema.path(path);

    if (pathschema) return pathschema;

  // look for arrays
  // return (function search (parts, schema) {
  //   var p = parts.length + 1
  //     , foundschema
  //     , trypath

  //   while (p--) {
  //     trypath = parts.slice(0, p).join('.');
  //     foundschema = schema.path(trypath);
  //     if (foundschema) {
  //       if (foundschema.caster) {

  //         // array of Mixed?
  //         if (foundschema.caster instanceof Types.Mixed) {
  //           return foundschema.caster;
  //         }

  //         // Now that we found the array, we need to check if there
  //         // are remaining document paths to look up for casting.
  //         // Also we need to handle array.$.path since schema.path
  //         // doesn't work for that.
  //         // If there is no foundschema.schema we are dealing with
  //         // a path like array.$
  //         if (p !== parts.length && foundschema.schema) {
  //           if ('$' === parts[p]) {
  //             // comments.$.comments.$.title
  //             return search(parts.slice(p+1), foundschema.schema);
  //           } else {
  //             // this is the last path of the selector
  //             return search(parts.slice(p), foundschema.schema);
  //           }
  //         }
  //       }
  //       return foundschema;
  //     }
  //   }
  // })(path.split('.'), schema)
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

Model.prototype.populate = function (docs, paths, cb) {
    // normalized paths
    var paths = parsePopulatePaths(paths);
    var pending = paths.length;

    if (0 === pending) {
        cb(null, docs);
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

    function next (err) {
    if (err) return cb(err);
    if (--pending) return;
        cb(null, docs);
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

function isNullOrUndefined (doc){return (doc === null) || (doc === undefined);}

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

  if (0 === docs.length || _.every(docs, isNullOrUndefined)) {
    return cb();
  }

  modelsMap = getModelsMapForPopulate(model, docs, options);
  rawIds = getIdsForAndAddIdsInMapPopulate(modelsMap);

  var i, len = modelsMap.length,
    mod, match, select, promise, vals = [];

  var _remaining = len;
  for (i = 0; i < len; i++) {
    mod = modelsMap[i];
    select = mod.options.select;

    if (mod.options.match) {
      match = utils.object.shallowCopy(mod.options.match);
    } else {
      match = {};
    }

    var ids = _.chain(mod.ids)
    .flatten()
    .filter(function(item) {
      // no need to include undefined values in our query
      return undefined !== item;
    })
    .uniq()
    .value();

    if (0 === ids.length || _.every(ids, isNullOrUndefined)) {
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
        select = _.clone(select);
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
    if (err) return resolved(err);
    vals = vals.concat(valsFromDb);
    if (--_remaining === 0) {
      resolved(err, vals, options, assignmentOpts);
    }
  }

  function resolved(err, vals, options, assignmentOpts) {
    if (err) return cb(err);

    var lean = options.options && options.options.lean,
      len = vals.length,
      rawOrder = {}, rawDocs = {}, key, val;

    // optimization:
    // record the document positions as returned by
    // the query result.
    for (var i = 0; i < len; i++) {
      val = vals[i];
      key = String(_.result(val, '_id'));
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
  }
}

function getModelsMapForPopulate(model, docs, options) {
debugger
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
      modelNames = _.result(doc, refPath); //utils.getValue(refPath, doc);
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
        Model = model.minimongoose.models[modelName];
        currentOptions = {
          model: Model
        };

        if(schema && !discriminatorKey){
          options.model = Model;
        }

        _.defaults(currentOptions, options);

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
      id = String(_.result(doc, "_id"));
      isDocument = !! doc.$__;

      if (!ret || Array.isArray(ret) && 0 === ret.length) {
        ret = _.result(doc, path);
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

/*!
 * Retrieve the _id of `val` if a Document or Array of Documents.
 *
 * @param {Array|Document|Any} val
 * @return {Array|Document|Any}
 */

function convertTo_id (val) {
  if (val instanceof Model) return val._id;

  if (Array.isArray(val)) {
    for (var i = 0; i < val.length; ++i) {
      if (val[i] instanceof Model) {
        val[i] = val[i]._id;
      }
    }
    return val;
  }

  return val;
}

/*!
 * Assigns documents returned from a population query back
 * to the original document path.
 */
function assignVals (o) {
  // replace the original ids in our intermediate _ids structure
  // with the documents found by query

  assignRawDocsToIdStructure(o.rawIds, o.rawDocs, o.rawOrder, o.options);

  // now update the original documents being populated using the
  // result structure that contains real documents.

  var docs = o.docs;
  var path = o.path;
  var rawIds = o.rawIds;
  var options = o.options;

  for (var i = 0; i < docs.length; ++i) {
    if (_.result(docs[i], path) == null)
      continue;
    docs[i][path] = rawIds[i];
    // utils.setValue(path, rawIds[i], docs[i], function (val) {
    //   return valueFilter(val, options);
    // });
  }
}

/*!
 * Assign `vals` returned by mongo query to the `rawIds`
 * structure returned from utils.getVals() honoring
 * query sort order if specified by user.
 *
 * This can be optimized.
 *
 * Rules:
 *
 *   if the value of the path is not an array, use findOne rules, else find.
 *   for findOne the results are assigned directly to doc path (including null results).
 *   for find, if user specified sort order, results are assigned directly
 *   else documents are put back in original order of array if found in results
 *
 * @param {Array} rawIds
 * @param {Array} vals
 * @param {Boolean} sort
 * @api private
 */

function assignRawDocsToIdStructure (rawIds, resultDocs, resultOrder, options, recursed) {
  // honor user specified sort order
  var newOrder = [];
  var sorting = options.sort && rawIds.length > 1;
  var found;
  var doc;
  var sid;
  var id;

  for (var i = 0; i < rawIds.length; ++i) {
    id = rawIds[i];

    if (Array.isArray(id)) {
      // handle [ [id0, id2], [id3] ]
      assignRawDocsToIdStructure(id, resultDocs, resultOrder, options, true);
      newOrder.push(id);
      continue;
    }

    if (null === id && !sorting) {
      // keep nulls for findOne unless sorting, which always
      // removes them (backward compat)
      newOrder.push(id);
      continue;
    }

    sid = String(id);
    found = false;

    if (recursed) {
      // apply find behavior

      // assign matching documents in original order unless sorting
      doc = resultDocs[sid];
      if (doc) {
        if (sorting) {
          newOrder[resultOrder[sid]] = doc;
        } else {
          newOrder.push(doc);
        }
      } else {
        newOrder.push(id);
      }
    } else {
      // apply findOne behavior - if document in results, assign, else assign null
      newOrder[i] = doc = resultDocs[sid] || null;
    }
  }

  rawIds.length = 0;
  if (newOrder.length) {
    // reassign the documents based on corrected order

    // forEach skips over sparse entries in arrays so we
    // can safely use this to our advantage dealing with sorted
    // result sets too.
    newOrder.forEach(function (doc, i) {
      rawIds[i] = doc;
    });
  }
}

module.exports = {
    Model: Model
};