"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = exports.ConfigurationValidationError = exports.ConfigurationError = void 0;
const Proxify_1 = require("../utils/Proxify");
const JsonValidator_1 = require("../utils/JsonValidator");
const object_1 = require("../utils/object");
const expression_1 = require("../utils/expression");
const yaml = require("js-yaml");
const fs = require("fs");
class ConfigurationError extends Error {
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
exports.ConfigurationError = ConfigurationError;
class ConfigurationValidationError extends Error {
    constructor(e) {
        super('Configuration is not valid by schema.');
        this.details = e.details.map((detail) => `${detail.field}${detail.humanKeyName ? `(${detail.humanKeyName})` : ``}: ${detail.message}`);
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            this.__proto__ = actualProto;
        }
    }
}
exports.ConfigurationValidationError = ConfigurationValidationError;
class Configuration {
    constructor(schema) {
        this.schema = schema;
        this.internalData = {};
    }
    static async load(schema, filepaths) {
        const instance = new Configuration(schema);
        const sources = await Promise.all(filepaths.map(async (path) => {
            try {
                return yaml.load(fs.readFileSync(path, 'utf8'));
            }
            catch (e) {
                throw new ConfigurationError(`Loading configuration from file ${path} failed with error: ${e.message}`);
            }
        }));
        console.log('Sources', sources);
        instance.load(...sources);
        instance.validate();
        return instance;
    }
    get data() {
        return Proxify_1.Proxify.wrap(this.internalData);
    }
    get(key) {
        return expression_1.getByExpression(this.data, key);
    }
    set(key, value) {
        expression_1.setByExpression(this.internalData, key, value);
        this.validate();
    }
    load(...sources) {
        this.internalData = object_1.mergeDeep(this.internalData, ...sources);
    }
    validate() {
        try {
            this.internalData = JsonValidator_1.JsonValidator.validate(this.internalData, {
                type: JsonValidator_1.JsonValidatorType.Object,
                additinalProperties: JsonValidator_1.JsonValidatorAdditionalProperties.Remove,
                childs: this.schema,
            });
        }
        catch (e) {
            this.internalData = null;
            if (e instanceof JsonValidator_1.JsonValidationFieldError) {
                throw new ConfigurationValidationError(e);
            }
            throw e;
        }
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=Configuration.js.map