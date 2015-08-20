import * as _ from '../lib/lodash';
// http://ericwooley.github.io/immutablejs/react/2015/04/01/using-immutablejs/
import * as Immutable from 'immutable';
import {compileDocumentSelector, compileSort} from './selector';

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
            // get string of mongoose's bson object (node specific)
            doc._id = doc._id.toString();
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

function removerImmutable(items, docs){
    items.withMutations(function(map){
        maps.forEach(function(doc, key){
            map.remove(key);
        });
        return map;
    });
}

function checker(items, key){
    return Boolean(items[key]);
}

function checkerImmutable(items, key){
    return Boolean(items.get(key));
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

    var query = items.filter(function(doc){
        return compileDocumentSelector(match)(doc);
    });

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

function populateHashFinder(items, match, options){
    options = options || {};

    var query = {};

    _.forEach(match._id.$in, function(id){
        query[id] = items[id];
    });

    query = _.chain(query);

    if (_.keys(match).length !== 1 && match._id && match._id.$in){
        query = query.filter(function(doc){
            return compileDocumentSelector(match)(doc);
        });
    }

    query.cloneDeep();

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

function populateHashFinderImmutable(items, match, options){
    options = options || {};

    var query;
    if (_.keys(match).length === 1 && match._id && match._id.$in){
        query = items;

    // if its a populate with constraints, shrink the space
    } else {
        query = Immutable.OrderedMap().withMutations(function(map){
            _.forEach(match._id.$in, function(id){
                map = map.set(id, items.get(id));
            });
            return map;
        });

        query = query.filter(function(doc){
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

finder = finderImmutable;
seeder = seederImmutable;
remover = removerImmutable;
checker = checkerImmutable;
populateHashFinder = populateHashFinderImmutable;
items = itemsImmutable;

export {
    finder,
    seeder,
    remover,
    checker,
    populateHashFinder,
    items
};