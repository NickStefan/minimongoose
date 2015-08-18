function isImmutable(thing){
    return isList(thing) || isMap(thing) || isSet(thing) || isOrderedSet(thing) || isOrderedMap(thing);
}

function isList(thing){
	return thing instanceof Object && thing['@@__IMMUTABLE_LIST__@@'];
}

function isMap(thing){
	return thing instanceof Object && thing['@@__IMMUTABLE_MAP__@@'];
}

function isSet(thing){
	return thing instanceof Object && thing['@@__IMMUTABLE_SET__@@'];
}

function isOrderedSet(thing){
	return thing instanceof Object && thing['@@__IMMUTABLE_ORDERED__@@'] && thing.hasOwnProperty('__hash');
}

function isOrderedMap(thing){
	return thing instanceof Object && thing['@@__IMMUTABLE_ORDERED__@@'] && !thing.hasOwnProperty('__hash');
}

module.exports = {
	isImmutable: isImmutable,
	isList: isList,
	isMap: isMap,
	isSet: isSet,
	isOrderedSet: isOrderedSet,
	isOrderedMap: isOrderedMap
};