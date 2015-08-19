var _ = require('../lib/lodash');
var Immutable = require('immutable');
// http://ericwooley.github.io/immutablejs/react/2015/04/01/using-immutablejs/
var compileSort = require('./selector').compileSort;
var compileDocumentSelector = require('./selector').compileDocumentSelector;

function items(){
    return {};
}

function itemsImmutable(){
    return Immutable.OrderedMap();
}

function seeder(items, docs){
    if (!_.isArray(docs)) {
        docs = [docs];
    }
    _.forEach(docs, function(doc){
        if (_.has(doc, '_id')){
            items[doc._id] = doc;
        }
    });
    return items;
}

function seederImmutable(items, docs){
    if (!_.isArray(docs)) {
        docs = [docs];
    }

    var docs = Immutable.fromJS(docs);
    return items.withMutations(function(map){
        docs.forEach(function(doc){
            map = map.set(doc.get('_id'), doc);
        });
        return map;
    });
}

function remover(items, docs){
    _.forEach(docs, function(doc){
        delete items[doc._id];
    });
}

function removerImmutable(collection, items, docs){
    // TODO
}

function finder(items, match, options) {
    options = options || {};
    // prepare lazy lodash query
    var query = _.chain(items)
                .values()
                .filter(compileDocumentSelector(match))
                .cloneDeep()

    if (options.sort) {
        query = query.sort(compileSort(options.sort))
    }
    if (options.skip) {
        query = query.slice(options.skip);
    }
    if (options.limit) {
        query = query.slice(0, options.limit);
    }
    if (options.fields) {
        query = query.map(function(doc){ return _.pick(doc, options.fields)});
    }

    // lodash lazy evaluate the query
    // http://filimanjaro.com/blog/2014/introducing-lazy-evaluation/
    return query.value();
}

function finderImmutable(items, match, options){
    options = options || {};

    // if its a straight populate, use hash table shortcut
    var query;
    if (_.keys(match).length === 1 && match._id && match._id.$in){
        query = items;

    // if its a populate with constraints, shrink the space
    } else if (match._id && match._id.$in){
        query = Immutable.OrderedMap().withMutations(function(map){
            _.forEach(match._id.$in, function(id){
                map = map.set(id, items.get(id));
            });
            return map;
        });

    // not a populate
    } else {
        query = items.filter(function(doc){
            return compileDocumentSelector(match)(doc);
        });
    }

    if (options.sort) {
        // TODO
        // make work with immutable
        query = query.sort(compileSort(options.sort));
    }
    if (options.skip) {
        query = query.slice(options.skip);
    }
    if (options.limit) {
        query = query.slice(0, options.limit);
    }
    if (options.fields) {
        // TODO
        // make work with immutable
        query = query.map(function(doc){ return _.pick(doc, options.fields)});
    }
    return query;
}

module.exports = {
	finder: finder,
    seeder: seeder,
    remover: remover,
    items: items
};

// module.exports = {
//     finder: finderImmutable,
//     seeder: seederImmutable,
//     remover: removerImmutable,
//     items: itemsImmutable
// };