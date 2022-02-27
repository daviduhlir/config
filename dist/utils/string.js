"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceAll = exports.lastChar = exports.toLower = exports.toUpper = exports.capitalize = void 0;
function capitalize(input, locale) {
    const parts = input.split(' ');
    return parts.map((part) => {
        const firstChar = locale ? part.charAt(0).toLocaleUpperCase(locale) : part.charAt(0).toUpperCase();
        return firstChar + part.slice(1).toLowerCase();
    }).join(' ');
}
exports.capitalize = capitalize;
function toUpper(input, locale) {
    return locale ? input.toLocaleUpperCase(locale) : input.toUpperCase();
}
exports.toUpper = toUpper;
function toLower(input, locale) {
    return locale ? input.toLocaleLowerCase(locale) : input.toLowerCase();
}
exports.toLower = toLower;
function lastChar(input) {
    return input.substr(-1);
}
exports.lastChar = lastChar;
function replaceAll(input, search, replacement) {
    return input.replace(new RegExp(search, 'g'), replacement);
}
exports.replaceAll = replaceAll;
//# sourceMappingURL=string.js.map