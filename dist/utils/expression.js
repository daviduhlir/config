"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstProperty = exports.setByExpression = exports.getByExpression = void 0;
const safe_1 = require("./safe");
const string_1 = require("./string");
function prepareExpression(exp) {
    const reg = /(\[\'([^\[\]\"]+)\'\]|\[\"([^\[\]\"]+)\"\]|\[([^\.\[\]\"]+)\]|([^\.\[\]\"]+))/g;
    const out = [];
    let match = null;
    while ((match = reg.exec(exp)) !== null) {
        for (let i = 5; i > 0; i--) {
            if (match[i]) {
                out.push(match[i]);
                break;
            }
        }
    }
    return out
        .map((t) => '["' + t + '"]')
        .join('');
}
function getNumberFromAny(value) {
    const val = parseInt(value, 10);
    if (isNaN(val) || val.toString().length !== value.toString().length) {
        return null;
    }
    return val;
}
function addMissings(object, exp) {
    const parts = string_1.replaceAll(exp, '"', '').split(/\[([^\[\]]*)\]/).filter((part) => part.length);
    let pointer = object;
    for (let i = 0; i < parts.length - 1; i++) {
        if (typeof pointer[parts[i]] === 'undefined' || pointer[parts[i]] === null) {
            const numberIndexNext = getNumberFromAny(parts[i + 1]);
            if (numberIndexNext === null) {
                pointer[parts[i]] = {};
            }
            else {
                pointer[parts[i]] = [];
            }
        }
        pointer = pointer[parts[i]];
    }
}
function getByExpression(object, exp) {
    const preparedExp = prepareExpression(exp);
    let i = undefined;
    safe_1.safe(() => eval('i = object' + preparedExp), undefined);
    return i;
}
exports.getByExpression = getByExpression;
function setByExpression(object, exp, value) {
    const preparedExp = prepareExpression(exp);
    addMissings(object, preparedExp);
    safe_1.safe(() => eval('object' + preparedExp + '= value'), undefined);
}
exports.setByExpression = setByExpression;
function getFirstProperty(expression) {
    return expression.split('.')[0].split('[')[0];
}
exports.getFirstProperty = getFirstProperty;
//# sourceMappingURL=expression.js.map