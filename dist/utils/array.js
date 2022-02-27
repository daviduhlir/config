"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findDuplicities = exports.arrayShuffle = exports.arrayDiff = exports.mergeArrays = exports.arrayUnique = exports.getFirstOf = exports.asyncFilter = exports.flatten = void 0;
const typechecks_1 = require("./typechecks");
const expression_1 = require("./expression");
function flatten(arr) {
    return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
}
exports.flatten = flatten;
async function asyncFilter(array, callback) {
    const fail = Symbol();
    return (await Promise.all(array.map(async (item) => (await callback(item)) ? item : fail))).filter((i) => i !== fail);
}
exports.asyncFilter = asyncFilter;
function getFirstOf(array) {
    for (const i of array) {
        if (typechecks_1.isSet(i)) {
            return i;
        }
    }
    return null;
}
exports.getFirstOf = getFirstOf;
function arrayUnique(array) {
    const a = array.concat();
    for (let i = 0; i < a.length; ++i) {
        for (let j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j]) {
                a.splice(j--, 1);
            }
        }
    }
    return a;
}
exports.arrayUnique = arrayUnique;
function mergeArrays(array1, array2) {
    return arrayUnique([...array1, ...array2]);
}
exports.mergeArrays = mergeArrays;
function arrayDiff(arr1, arr2) {
    return arr1.filter((x) => !arr2.includes(x));
}
exports.arrayDiff = arrayDiff;
function arrayShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
exports.arrayShuffle = arrayShuffle;
function findDuplicities(array, key) {
    let notUniques = [];
    array.forEach((item1, index1) => {
        const found = array.findIndex((item2, index2) => {
            if (index1 === index2) {
                return false;
            }
            if (key) {
                return expression_1.getByExpression(item1, key) === expression_1.getByExpression(item2, key);
            }
            else {
                return item2 === item1;
            }
        });
        if (found !== -1 && !notUniques.includes(found)) {
            notUniques.push(found);
        }
    });
    return notUniques;
}
exports.findDuplicities = findDuplicities;
//# sourceMappingURL=array.js.map