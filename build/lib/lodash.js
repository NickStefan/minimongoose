// need to use lodash CLI to get custom build with chaining
//forEachRight,slice,isNaN,each,forEach,extend,isObject,isArray,isEmpty,any,every,all,has,map,filter,size,isArguments,isFunction,cloneDeep,object,pluck,pick,first,rest,last,values,defaults,isEqual,result,chain,value,flatten,uniq,keys
'use strict';

exports.__esModule = true;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _lodashCustomMin = require('./lodash.custom.min');

var _ = _interopRequireWildcard(_lodashCustomMin);

exports['default'] = _;

// need to use lodash-compat for ie8
// module.exports = require('lodash-compat');
module.exports = exports['default'];