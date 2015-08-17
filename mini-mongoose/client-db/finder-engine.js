var _ = require('../lib/lodash');

var compileSort = require('./selector').compileSort;
var compileDocumentSelector = require('./selector').compileDocumentSelector;

var finderEngine = function(items, match, options) {
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
};

module.exports = {
	finderEngine: finderEngine
};