"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayContainsOneOfValue = exports.arrayContainsValues = exports.objectHasKeys = exports.isRegExp = exports.isArrayTypeGuard = exports.isArrayInstancesOf = exports.isSet = exports.isUndefined = exports.isError = exports.isArray = exports.isBuffer = exports.isDate = exports.isFunction = exports.isBoolean = exports.isNumber = exports.isString = exports.isDataObject = exports.isObjectInstance = exports.isObject = exports.typeGuard = void 0;
function typeGuard(ref, t) {
    const localPrimitiveOrConstructor = t;
    if (typeof localPrimitiveOrConstructor === 'string') {
        return typeof ref === localPrimitiveOrConstructor;
    }
    return ref instanceof localPrimitiveOrConstructor;
}
exports.typeGuard = typeGuard;
function isObject(ref) {
    return typeof ref === 'object' && ref !== null;
}
exports.isObject = isObject;
function isObjectInstance(ref, t) {
    return typeof ref === 'object' && ref !== null && ref instanceof t;
}
exports.isObjectInstance = isObjectInstance;
function isDataObject(ref) {
    return typeof ref === 'object' && ref !== null && ref.constructor === Object;
}
exports.isDataObject = isDataObject;
function isString(ref) {
    return typeof ref === 'string';
}
exports.isString = isString;
function isNumber(ref) {
    return typeof ref === 'number';
}
exports.isNumber = isNumber;
function isBoolean(ref) {
    return typeof ref === 'boolean';
}
exports.isBoolean = isBoolean;
function isFunction(ref) {
    return typeof ref === 'function';
}
exports.isFunction = isFunction;
function isDate(ref) {
    return ref instanceof Date;
}
exports.isDate = isDate;
function isBuffer(ref) {
    return ref instanceof Buffer;
}
exports.isBuffer = isBuffer;
function isArray(ref) {
    return Array.isArray(ref);
}
exports.isArray = isArray;
function isError(ref) {
    return ref instanceof Buffer;
}
exports.isError = isError;
function isUndefined(ref) {
    return typeof ref === 'undefined';
}
exports.isUndefined = isUndefined;
function isSet(ref) {
    return ref !== null && !isUndefined(ref);
}
exports.isSet = isSet;
function isArrayInstancesOf(ref, t) {
    return Array.isArray(ref) && !ref.some((value) => !(value instanceof t));
}
exports.isArrayInstancesOf = isArrayInstancesOf;
function isArrayTypeGuard(ref, t) {
    return Array.isArray(ref) && !ref.some((value) => !(typeGuard(value, t)));
}
exports.isArrayTypeGuard = isArrayTypeGuard;
function isRegExp(ref) {
    return ref instanceof RegExp;
}
exports.isRegExp = isRegExp;
function objectHasKeys(ref, keys) {
    const objectKeys = Object.keys(ref);
    return keys.every((value) => objectKeys.indexOf(value) >= 0);
}
exports.objectHasKeys = objectHasKeys;
function arrayContainsValues(array, values) {
    if (!values) {
        return true;
    }
    return values.every(v => array.includes(v));
}
exports.arrayContainsValues = arrayContainsValues;
function arrayContainsOneOfValue(array, values) {
    if (!values) {
        return true;
    }
    return values.some(v => array.includes(v));
}
exports.arrayContainsOneOfValue = arrayContainsOneOfValue;
//# sourceMappingURL=typechecks.js.map