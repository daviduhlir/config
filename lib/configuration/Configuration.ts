import {
    JsonValidator,
    JsonValidatorObjectChildsSchema,
    JsonValidatorType,
    JsonValidatorAdditionalProperties,
    JsonObjectFromSchema,
    JsonValidationFieldError,
    Proxify,
} from '@david.uhlir/common';
import { mergeDeep } from '../utils/object'
import { getByExpression, setByExpression } from '../utils/expression';
import * as yaml from 'js-yaml';
import * as fs from 'fs';

/**
 * Configuration schema error
 */
 export class ConfigurationError extends Error {
    constructor(message: string) {
        super(message);

        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        } else {
            (this as any).__proto__ = actualProto;
        }
    }
}

/**
 * Configuration schema error
 */
export class ConfigurationValidationError extends Error {
    public details;
    constructor(
        e: JsonValidationFieldError,
    ) {
        super('Configuration is not valid by schema.');
        this.details = e.details.map((detail) =>
            `${detail.field}${detail.humanKeyName ? `(${detail.humanKeyName})` : ``}: ${detail.message}`
        );

        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        } else {
            (this as any).__proto__ = actualProto;
        }
    }
}

/**
 * Main configuration object, it will load parse yml files and validate it by schema.
 *
 * TODO this class should accepts something like alises for setting data by env.
 */
export class Configuration<T extends JsonValidatorObjectChildsSchema> {
    /**
     * Load configuration from files
     * @param schema
     * @param filepaths
     * @returns
     */
    public static async load<T extends JsonValidatorObjectChildsSchema>(
        schema: T,
        filepaths: string[],
        override: Partial<T> = {}
    ) {
        const instance = new Configuration<T>(schema);

        const sources = await Promise.all(filepaths.map(async path => {
            // Get document, or throw exception on error
            try {
                return yaml.load(fs.readFileSync(path, 'utf8'));
            } catch (e) {
                throw new ConfigurationError(`Loading configuration from file ${path} failed with error: ${e.message}`);
            }
        }));

        instance.load(...sources);
        instance.validate();
        return instance;
    }

    constructor(
        protected readonly schema: T
    ) {}

    /**
     * Get configuration data
     */
    public get data(): JsonObjectFromSchema<T> {
        return Proxify.wrap(this.internalData) as any;
    }

    /**
     * Get configuration data by key
     */
    public get<K>(key: string): K {
        return getByExpression(this.data, key);
    }

    /**********************************
     *
     * Internal methods
     *
     **********************************/
    protected internalData: JsonObjectFromSchema<T> = {} as any;

    /**
     * Set configuration data by key
     */
    public set(key: string, value: any) {
        setByExpression(this.internalData, key, value);
        this.validate();
    }

    /**
     * Incrementaly add data by source
     */
    protected load(...sources: Partial<JsonObjectFromSchema<T>>[]) {
        this.internalData = mergeDeep(this.internalData, ...sources) as JsonObjectFromSchema<T>;
    }

    /**
     * Override some config values, for example from env
     */
    protected override(data: Partial<JsonObjectFromSchema<T>>) {
        this.internalData = mergeDeep(this.internalData, data) as JsonObjectFromSchema<T>;
    }

    /**
     * Validate final configuration
     */
    protected validate() {
        try {
            this.internalData = JsonValidator.validate(
                this.internalData,
                {
                    type: JsonValidatorType.Object,
                    additinalProperties: JsonValidatorAdditionalProperties.Remove,
                    childs: this.schema,
                },
            );
        } catch (e) {
            this.internalData = null;

            if (e instanceof JsonValidationFieldError) {
                throw new ConfigurationValidationError(e);
            }

            throw e;
        }
    }
}
