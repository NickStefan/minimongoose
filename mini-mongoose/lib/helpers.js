function isImmutable(thing){
    return Boolean(isList(thing) || isMap(thing) || isSet(thing) || isOrderedSet(thing) || isOrderedMap(thing));
}

function isList(thing){
	return Boolean(thing instanceof Object && thing['@@__IMMUTABLE_LIST__@@']);
}

function isMap(thing){
	return Boolean(thing instanceof Object && thing['@@__IMMUTABLE_MAP__@@']);
}

function isSet(thing){
	return Boolean(thing instanceof Object && thing['@@__IMMUTABLE_SET__@@']);
}

function isOrderedSet(thing){
	return Boolean(thing instanceof Object && thing['@@__IMMUTABLE_ORDERED__@@'] && thing['@@__IMMUTABLE_SET__@@']);
}

function isOrderedMap(thing){
	return Boolean(thing instanceof Object && thing['@@__IMMUTABLE_ORDERED__@@'] && thing['@@__IMMUTABLE_MAP__@@']);
}

export {
	isImmutable,
	isList,
	isMap,
	isSet,
	isOrderedSet,
	isOrderedMap
};