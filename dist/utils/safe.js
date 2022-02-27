"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notNaN = exports.notNull = exports.safe = void 0;
function safe(expression, defaultValue) {
    try {
        const value = expression();
        if (typeof value !== 'undefined') {
            return value;
        }
        else {
            return defaultValue;
        }
    }
    catch (e) {
        return defaultValue;
    }
}
exports.safe = safe;
function notNull(value) {
    if (value === null) {
        throw new Error('Value cant be null');
    }
    return value;
}
exports.notNull = notNull;
function notNaN(value) {
    if (typeof value !== 'number' || (typeof value === 'number' && isNaN(value))) {
        throw new Error('Value must be number');
    }
    return value;
}
exports.notNaN = notNaN;
//# sourceMappingURL=safe.js.map