'use strict';

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _libLodash = require('../lib/lodash');

var _ = _interopRequireWildcard(_libLodash);

// http://ericwooley.github.io/immutablejs/react/2015/04/01/using-immutablejs/

var _immutable = require('immutable');

var Immutable = _interopRequireWildcard(_immutable);

var _selector = require('./selector');

function items() {
    return {};
}

function itemsImmutable() {
    return Immutable.OrderedMap();
}

function seeder(items, docs) {
    if (!_.isArray(docs)) {
        docs = [docs];
    }
    _.forEach(docs, function (doc) {
        if (_.has(doc, '_id')) {
            // get string of mongoose's bson object (node specific)
            doc._id = doc._id.toString();
            items[doc._id] = doc;
        }
    });
    return items;
}

function seederImmutable(items, docs) {
    if (!_.isArray(docs)) {
        docs = [docs];
    }

    var docs = Immutable.fromJS(docs);
    return items.withMutations(function (map) {
        docs.forEach(function (doc) {
            map = map.set(doc.get('_id'), doc);
        });
        return map;
    });
}

function remover(items, docs) {
    _.forEach(docs, function (doc) {
        delete items[doc._id];
    });
}

function removerImmutable(items, docs) {
    items.withMutations(function (map) {
        maps.forEach(function (doc, key) {
            map.remove(key);
        });
        return map;
    });
}

function checker(items, key) {
    return Boolean(items[key]);
}

function checkerImmutable(items, key) {
    return Boolean(items.get(key));
}

function finder(items, match, options) {
    options = options || {};
    // prepare lazy lodash query
    var query = _.chain(items).values().filter(_selector.compileDocumentSelector(match)).cloneDeep();

    if (options.sort) {
        query = query.sort(_selector.compileSort(options.sort));
    }
    if (options.skip) {
        query = query.slice(options.skip);
    }
    if (options.limit) {
        query = query.slice(0, options.limit);
    }
    if (options.fields) {
        query = query.map(function (doc) {
            return _.pick(doc, options.fields);
        });
    }

    // lodash lazy evaluate the query
    // http://filimanjaro.com/blog/2014/introducing-lazy-evaluation/
    return query.value();
}

function finderImmutable(items, match, options) {
    options = options || {};

    var query = items.filter(function (doc) {
        return _selector.compileDocumentSelector(match)(doc);
    });

    if (options.sort) {
        // TODO
        // make work with immutable
        query = query.sort(_selector.compileSort(options.sort));
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
        query = query.map(function (doc) {
            return _.pick(doc, options.fields);
        });
    }
    return query;
}

function populateHashFinder(items, match, options) {
    options = options || {};

    var query = {};

    _.forEach(match._id.$in, function (id) {
        query[id] = items[id];
    });

    query = _.chain(query);

    if (_.keys(match).length !== 1 && match._id && match._id.$in) {
        query = query.filter(function (doc) {
            return _selector.compileDocumentSelector(match)(doc);
        });
    }

    query.cloneDeep();

    if (options.sort) {
        query = query.sort(_selector.compileSort(options.sort));
    }
    if (options.skip) {
        query = query.slice(options.skip);
    }
    if (options.limit) {
        query = query.slice(0, options.limit);
    }
    if (options.fields) {
        query = query.map(function (doc) {
            return _.pick(doc, options.fields);
        });
    }

    // lodash lazy evaluate the query
    // http://filimanjaro.com/blog/2014/introducing-lazy-evaluation/
    return query.value();
}

function populateHashFinderImmutable(items, match, options) {
    options = options || {};

    var query;
    if (_.keys(match).length === 1 && match._id && match._id.$in) {
        query = items;

        // if its a populate with constraints, shrink the space
    } else {
            query = Immutable.OrderedMap().withMutations(function (map) {
                _.forEach(match._id.$in, function (id) {
                    map = map.set(id, items.get(id));
                });
                return map;
            });

            query = query.filter(function (doc) {
                return _selector.compileDocumentSelector(match)(doc);
            });
        }

    if (options.sort) {
        // TODO
        // make work with immutable
        query = query.sort(_selector.compileSort(options.sort));
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
        query = query.map(function (doc) {
            return _.pick(doc, options.fields);
        });
    }
    return query;
}

exports.finder = finder = finderImmutable;
exports.seeder = seeder = seederImmutable;
exports.remover = remover = removerImmutable;
exports.checker = checker = checkerImmutable;
exports.populateHashFinder = populateHashFinder = populateHashFinderImmutable;
exports.items = items = itemsImmutable;

exports.finder = finder;
exports.seeder = seeder;
exports.remover = remover;
exports.checker = checker;
exports.populateHashFinder = populateHashFinder;
exports.items = items;