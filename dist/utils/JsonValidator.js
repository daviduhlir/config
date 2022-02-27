"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonValidator = exports.required = exports.JsonValidatorAdditionalProperties = exports.JsonValidatorArrayUnique = exports.JsonValidatorRequired = exports.JsonValidatorType = exports.JsonValidatorTransforms = exports.JsonValidationFieldError = exports.JsonValidationError = exports.ObjectId = void 0;
const typechecks_1 = require("./typechecks");
const array_1 = require("./array");
class ObjectId extends String {
}
exports.ObjectId = ObjectId;
class JsonValidationError extends Error {
    constructor(message) {
        super(message);
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            this.__proto__ = actualProto;
        }
    }
}
exports.JsonValidationError = JsonValidationError;
class JsonValidationFieldError extends JsonValidationError {
    constructor(details) {
        super('Field validation failed');
        this.details = details;
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            this.__proto__ = actualProto;
        }
    }
}
exports.JsonValidationFieldError = JsonValidationFieldError;
exports.JsonValidatorTransforms = {
    toFloat: ((value) => {
        if (typechecks_1.isString(value)) {
            return parseFloat(value);
        }
        throw new Error(`Input of JsonValidatorTransforms.toFloat is not string`);
    }),
    toInteger: ((value) => {
        if (typechecks_1.isString(value)) {
            return parseInt(value, 10);
        }
        throw new Error(`Input of JsonValidatorTransforms.toInteger is not string`);
    }),
    toObjectId: ((value) => {
        if (typechecks_1.isString(value)) {
            return new ObjectId(value);
        }
        throw new Error(`Input of JsonValidatorTransforms.toObjectId is not string`);
    }),
    toDate: ((value) => {
        if (typechecks_1.isString(value)) {
            return new Date(value);
        }
        throw new Error(`Input of JsonValidatorTransforms.toDate is not string`);
    }),
};
var JsonValidatorType;
(function (JsonValidatorType) {
    JsonValidatorType["Any"] = "Any";
    JsonValidatorType["Boolean"] = "Boolean";
    JsonValidatorType["Number"] = "Number";
    JsonValidatorType["String"] = "String";
    JsonValidatorType["Enum"] = "Enum";
    JsonValidatorType["Array"] = "Array";
    JsonValidatorType["Object"] = "Object";
})(JsonValidatorType = exports.JsonValidatorType || (exports.JsonValidatorType = {}));
var JsonValidatorRequired;
(function (JsonValidatorRequired) {
    JsonValidatorRequired["True"] = "True";
    JsonValidatorRequired["False"] = "False";
})(JsonValidatorRequired = exports.JsonValidatorRequired || (exports.JsonValidatorRequired = {}));
exports.JsonValidatorArrayUnique = '';
var JsonValidatorAdditionalProperties;
(function (JsonValidatorAdditionalProperties) {
    JsonValidatorAdditionalProperties["Reject"] = "Reject";
    JsonValidatorAdditionalProperties["Remove"] = "Remove";
})(JsonValidatorAdditionalProperties = exports.JsonValidatorAdditionalProperties || (exports.JsonValidatorAdditionalProperties = {}));
function required(input) {
    return {
        ...input,
        required: JsonValidatorRequired.True,
    };
}
exports.required = required;
class JsonValidator {
    static objectValidator(input, schema, additinalProperties = JsonValidatorAdditionalProperties.Remove) {
        if (!input) {
            throw new JsonValidationError('Object is empty');
        }
        if (!typechecks_1.isObject(input) || typechecks_1.isArray(input)) {
            throw new JsonValidationError('Input is not object');
        }
        return JsonValidator.validate(input, {
            type: JsonValidatorType.Object,
            childs: schema,
            additinalProperties,
        });
    }
    static validate(content, schema, parentKey = '', key = '') {
        const validators = {
            [JsonValidatorType.Any]: JsonValidator.validateAny,
            [JsonValidatorType.Boolean]: JsonValidator.validateBoolean,
            [JsonValidatorType.String]: JsonValidator.validateString,
            [JsonValidatorType.Number]: JsonValidator.validateNumber,
            [JsonValidatorType.Enum]: JsonValidator.validateEnum,
            [JsonValidatorType.Array]: JsonValidator.validateArray,
            [JsonValidatorType.Object]: JsonValidator.validateObject,
        };
        if (validators[schema.type]) {
            if (content === null && schema.nullable) {
                return null;
            }
            if (typechecks_1.isFunction(schema.parseTransform)) {
                content = schema.parseTransform(content);
            }
            let output = validators[schema.type](parentKey, key, content, schema);
            if (typechecks_1.isFunction(schema.outputTransform)) {
                output = schema.outputTransform(output);
            }
            return output;
        }
        throw new Error(`Type ${schema.type} is not supported`);
    }
    static validateAny(parentKey, key, content, schema) {
        return content;
    }
    static validateBoolean(parentKey, key, content, schema) {
        if (typechecks_1.isBoolean(content)) {
            return content;
        }
        throw new JsonValidationFieldError([{
                field: `${parentKey}${key}`,
                message: `Must be boolean`,
                humanKeyName: schema.humanKeyName,
            }]);
    }
    static validateString(parentKey, key, content, schema) {
        if (typechecks_1.isString(content)) {
            if (!typechecks_1.isUndefined(schema.minLength)) {
                if (content.length < schema.minLength) {
                    throw new JsonValidationFieldError([{
                            field: `${parentKey}${key}`,
                            message: `Minimal length is ${schema.minLength}`,
                            humanKeyName: schema.humanKeyName,
                        }]);
                }
            }
            if (!typechecks_1.isUndefined(schema.maxLength)) {
                if (content.length > schema.maxLength) {
                    throw new JsonValidationFieldError([{
                            field: `${parentKey}${key}`,
                            message: `Maximal length is ${schema.maxLength}`,
                            humanKeyName: schema.humanKeyName,
                        }]);
                }
            }
            if (schema.regexp) {
                let regExp = null;
                let message = `Doesn't match validation RegExp`;
                if (typechecks_1.isRegExp(schema.regexp)) {
                    regExp = schema.regexp;
                }
                else {
                    regExp = schema.regexp.regexp;
                    message = schema.regexp.message;
                }
                if (regExp.test(content)) {
                    if (schema.asDate) {
                        const date = new Date(content);
                        if (!typechecks_1.isDate(date) || isNaN(date.getTime())) {
                            throw new JsonValidationFieldError([{
                                    field: `${parentKey}${key}`,
                                    message: `Invalid date value`,
                                    humanKeyName: schema.humanKeyName,
                                }]);
                        }
                        return date;
                    }
                    else {
                        return content;
                    }
                }
                else {
                    throw new JsonValidationFieldError([{
                            field: `${parentKey}${key}`,
                            message,
                            humanKeyName: schema.humanKeyName,
                        }]);
                }
            }
            else {
                if (schema.asDate) {
                    const date = new Date(content);
                    if (!(date instanceof Date) || isNaN(date.getTime())) {
                        throw new JsonValidationFieldError([{
                                field: `${parentKey}${key}`,
                                message: `Invalid date value`,
                                humanKeyName: schema.humanKeyName,
                            }]);
                    }
                    return date;
                }
                else {
                    return content;
                }
            }
        }
        throw new JsonValidationFieldError([{
                field: `${parentKey}${key}`,
                message: `Must be string`,
                humanKeyName: schema.humanKeyName,
            }]);
    }
    static validateNumber(parentKey, key, content, schema) {
        if (typechecks_1.isNumber(content) && !isNaN(content)) {
            if (!typechecks_1.isUndefined(schema.min)) {
                if (content < schema.min) {
                    throw new JsonValidationFieldError([{
                            field: `${parentKey}${key}`,
                            message: `Minimal value is ${schema.min}`,
                            humanKeyName: schema.humanKeyName,
                        }]);
                }
            }
            if (!typechecks_1.isUndefined(schema.max)) {
                if (content > schema.max) {
                    throw new JsonValidationFieldError([{
                            field: `${parentKey}${key}`,
                            message: `Maximal value is ${schema.max}`,
                            humanKeyName: schema.humanKeyName,
                        }]);
                }
            }
            if (schema.asInteger && !Number.isInteger(content)) {
                throw new JsonValidationFieldError([{
                        field: `${parentKey}${key}`,
                        message: `Must be integer, not float`,
                        humanKeyName: schema.humanKeyName,
                    }]);
            }
            return content;
        }
        throw new JsonValidationFieldError([{
                field: `${parentKey}${key}`,
                message: `Must be number`,
                humanKeyName: schema.humanKeyName,
            }]);
    }
    static validateEnum(parentKey, key, content, schema) {
        if (!typechecks_1.isArray(schema.enum)) {
            throw new Error(`Missing 'enum' field in '${parentKey}${key}' format`);
        }
        if (typechecks_1.isString(content) && (schema.enum.indexOf(content) > -1)) {
            return content;
        }
        throw new JsonValidationFieldError([{
                field: `${parentKey}${key}`,
                message: `Must be one of following values [${schema.enum}]`,
                humanKeyName: schema.humanKeyName,
            }]);
    }
    static validateArray(parentKey, key, content, schema) {
        if (!schema.of) {
            throw new Error(`Missing 'of' field in '${parentKey}${key}' format`);
        }
        if (typechecks_1.isArray(content)) {
            if (!typechecks_1.isUndefined(schema.minLength)) {
                if (content.length < schema.minLength) {
                    throw new JsonValidationFieldError([{
                            field: `${parentKey}${key}`,
                            message: `Must have minimal length of ${schema.minLength} items`,
                            humanKeyName: schema.humanKeyName,
                        }]);
                }
            }
            if (!typechecks_1.isUndefined(schema.maxLength)) {
                if (content.length > schema.maxLength) {
                    throw new JsonValidationFieldError([{
                            field: `${parentKey}${key}`,
                            message: `Must have maximal length of ${schema.maxLength} items`,
                            humanKeyName: schema.humanKeyName,
                        }]);
                }
            }
            const acumulatedErrors = [];
            if (typechecks_1.isString(schema.unique)) {
                array_1.findDuplicities(content, schema.unique)
                    .forEach((index) => {
                    acumulatedErrors.push({
                        field: `${parentKey}${key}[${index}]${schema.unique ? '.' + schema.unique : schema.unique}`,
                        message: `Items must be unique`,
                        humanKeyName: schema.humanKeyName,
                    });
                });
            }
            content.forEach((item, index) => {
                try {
                    JsonValidator.validate(item, schema.of, `${parentKey}${key}`, `[${index}]`);
                }
                catch (e) {
                    if (e instanceof JsonValidationFieldError) {
                        acumulatedErrors.push(e.details);
                    }
                    else {
                        throw e;
                    }
                }
            });
            if (acumulatedErrors.length) {
                throw new JsonValidationFieldError(array_1.flatten(acumulatedErrors));
            }
            return content;
        }
        throw new JsonValidationFieldError([{
                field: `${parentKey}${key}`,
                message: `Must be array`,
                humanKeyName: schema.humanKeyName,
            }]);
    }
    static validateObject(parentKey, key, content, schema) {
        if ((!schema.childs || !typechecks_1.isObject(schema.childs)) && (!schema.of)) {
            throw new Error(`Missing 'childs' or 'of' field in '${parentKey}${key}' format`);
        }
        if (typechecks_1.isObject(content) && !typechecks_1.isArray(content)) {
            const objKeys = schema.childs ? Object.keys(schema.childs) : Object.keys(content);
            const outObject = {};
            const acumulatedErrors = [];
            objKeys.forEach((objKey) => {
                try {
                    let newParentKey = `${parentKey}${key}.`;
                    if (newParentKey === '.') {
                        newParentKey = '';
                    }
                    if (schema.keysRegexp) {
                        let regExp = null;
                        let message = `Doesn't match validation RegExp`;
                        if (schema.keysRegexp instanceof RegExp) {
                            regExp = schema.keysRegexp;
                        }
                        else {
                            regExp = schema.keysRegexp.regexp;
                            message = schema.keysRegexp.message;
                        }
                        if (!regExp.test(objKey)) {
                            throw new JsonValidationFieldError([{
                                    field: `${parentKey}${key}.${objKey}`,
                                    isOnKey: true,
                                    message,
                                }]);
                        }
                    }
                    if (!typechecks_1.isUndefined(content[objKey])) {
                        outObject[objKey] = JsonValidator.validate(content[objKey], (schema.childs ? schema.childs[objKey] : schema.of), newParentKey, objKey);
                    }
                    else if (schema.childs && schema.childs[objKey].required === JsonValidatorRequired.True) {
                        throw new JsonValidationFieldError([{
                                field: `${newParentKey}${objKey}`,
                                message: `Missing required field`,
                                humanKeyName: schema.humanKeyName,
                            }]);
                    }
                }
                catch (e) {
                    if (e instanceof JsonValidationFieldError) {
                        acumulatedErrors.push(e.details);
                    }
                    else {
                        throw e;
                    }
                }
            });
            if (acumulatedErrors.length) {
                throw new JsonValidationFieldError(array_1.flatten(acumulatedErrors));
            }
            const additinalProperties = schema.additinalProperties ? schema.additinalProperties : JsonValidatorAdditionalProperties.Remove;
            if (additinalProperties === JsonValidatorAdditionalProperties.Reject) {
                const keysContent = Object.keys(content);
                const keysOut = Object.keys(outObject);
                if (keysContent.length > keysOut.length) {
                    const diff = array_1.arrayDiff(keysContent, keysOut);
                    throw new JsonValidationFieldError(diff.map((additionalKey) => ({
                        field: `${parentKey}${key}.${additionalKey}`,
                        message: `Additional keys is not allowed`,
                        humanKeyName: schema.humanKeyName,
                    })));
                }
            }
            return {
                ...outObject
            };
        }
        throw new JsonValidationFieldError([{
                field: `${parentKey}${key}`,
                message: `Must be object`,
                humanKeyName: schema.humanKeyName,
            }]);
    }
}
exports.JsonValidator = JsonValidator;
//# sourceMappingURL=JsonValidator.js.map