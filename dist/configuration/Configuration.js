"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = exports.ConfigurationValidationError = exports.ConfigurationError = void 0;
const common_1 = require("@david.uhlir/common");
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
            ;
            this.__proto__ = actualProto;
        }
    }
}
exports.ConfigurationError = ConfigurationError;
class ConfigurationValidationError extends Error {
    constructor(e) {
        super('Configuration is not valid by schema.');
        this.details = e.details.map(detail => `${detail.field}${detail.humanKeyName ? `(${detail.humanKeyName})` : ``}: ${detail.message}`);
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        }
        else {
            ;
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
    static async load(schema, filepaths, override = {}) {
        const instance = new Configuration(schema);
        const sources = await Promise.all(filepaths.map(async (path) => {
            try {
                return yaml.load(fs.readFileSync(path, 'utf8'));
            }
            catch (e) {
                throw new ConfigurationError(`Loading configuration from file ${path} failed with error: ${e.message}`);
            }
        }));
        instance.load(...sources);
        instance.validate();
        return instance;
    }
    get data() {
        return common_1.Proxify.wrap(this.internalData);
    }
    get(key) {
        return common_1.getByExpression(this.data, key);
    }
    set(key, value) {
        common_1.setByExpression(this.internalData, key, value);
        this.validate();
    }
    load(...sources) {
        this.internalData = common_1.mergeDeep(this.internalData, ...sources);
    }
    override(data) {
        this.internalData = common_1.mergeDeep(this.internalData, data);
    }
    validate() {
        try {
            this.internalData = common_1.JsonValidator.validate(this.internalData, {
                type: common_1.JsonValidatorType.Object,
                additinalProperties: common_1.JsonValidatorAdditionalProperties.Remove,
                childs: this.schema,
            });
        }
        catch (e) {
            this.internalData = null;
            if (e instanceof common_1.JsonValidationFieldError) {
                throw new ConfigurationValidationError(e);
            }
            throw e;
        }
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=Configuration.js.map