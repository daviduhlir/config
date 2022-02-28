import { isString, isUndefined, isBoolean, isObject, isNumber, isArray, isRegExp, isDate, isFunction } from './typechecks';
import { flatten, arrayDiff, findDuplicities } from './array';

export class ObjectId extends String {}

/**********************
 *
 * Errors
 *
 **********************/
export class JsonValidationError extends Error {
    constructor(
        message: string,
    ) {
        super(message);
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        } else {
            (this as any).__proto__ = actualProto;
        }
    }
}

export interface JsonValidatorFieldErrorDetail {
    field: string;
    message: string;
    isOnKey?: boolean;
    humanKeyName?: string;
    fieldDescription?: string;
}

export class JsonValidationFieldError extends JsonValidationError {
    constructor(
        public readonly details: JsonValidatorFieldErrorDetail[],
    ) {
        super('Field validation failed');
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(this, actualProto);
        } else {
            (this as any).__proto__ = actualProto;
        }
    }
}

/**********************
 *
 * Transform functions
 *
 **********************/

export const JsonValidatorTransforms = {
    /**
     * Transform string to float number
     */
    toFloat: ((value: any): number => {
        if (isString(value)) {
            return parseFloat(value);
        }
        throw new Error(`Input of JsonValidatorTransforms.toFloat is not string`);
    }) as JsonValidatorTransformFunction<number>,
    /**
     * Transform string to integer number
     */
    toInteger: ((value: any): number => {
        if (isString(value)) {
            return parseInt(value, 10);
        }
        throw new Error(`Input of JsonValidatorTransforms.toInteger is not string`);
    }) as JsonValidatorTransformFunction<number>,
    /**
     * Transform string to ObjectId
     */
    toObjectId: ((value: any): ObjectId => {
        if (isString(value)) {
            return new ObjectId(value);
        }
        throw new Error(`Input of JsonValidatorTransforms.toObjectId is not string`);
    }) as JsonValidatorTransformFunction<ObjectId>,
    /**
     * Transform string to Date
     */
    toDate: ((value: any): Date => {
        if (isString(value)) {
            return new Date(value);
        }
        throw new Error(`Input of JsonValidatorTransforms.toDate is not string`);
    }) as JsonValidatorTransformFunction<Date>,
};

/**********************
 *
 * Data types
 *
 **********************/
export enum JsonValidatorType {
    Any = 'Any',
    Boolean = 'Boolean',
    Number = 'Number',
    String = 'String',
    Password = 'Password',
    Enum = 'Enum',
    Array = 'Array',
    Object = 'Object',
}

export interface TypeOfJsonValidatorType<OF = any> {
    [JsonValidatorType.Any]: any;
    [JsonValidatorType.String]: string;
    [JsonValidatorType.Password]: string;
    [JsonValidatorType.Array]: OF[];
    [JsonValidatorType.Boolean]: boolean;
    [JsonValidatorType.Enum]: string;
    [JsonValidatorType.Number]: number;
    [JsonValidatorType.Object]: { [key: string]: any};
}

export type JsonValidatorTransformFunction<T> = (value: any) => T;

export enum JsonValidatorRequired {
    True = 'True',
    False = 'False',
}

/**********************
 *
 * Common schemas
 *
 **********************/
export interface JsonValidatorCommonSchema<T> {
    /**
     * Type of validated key
     */
    type: T;

    /**
     * Is required (default: JsonValidatorRequired.False)
     */
    required?: Readonly<JsonValidatorRequired>;

    /**
     * Can be null
     */
    nullable?: boolean;

    /**
     * Human readable key name
     */
    humanKeyName?: string;

    /**
     * Transform input data (before validation)
     */
    parseTransform?: JsonValidatorTransformFunction<any>;

    /**
     * Transform output data (after validation)
     */
    outputTransform?: JsonValidatorTransformFunction<any>;

    /**
     * Some description of field
     */
    description?: string;
}

export interface JsonValidatorClampLengthSchema {
    /**
     * Minimal length of String or Array lenght
     */
    minLength?: number;
    /**
     * Maximal length of String or Array lenght
     */
    maxLength?: number;
}

export interface JsonValidatorCollectionSchema {
    /**
     * Type of Array childs (valid only for Array or Object)
     */
    of?: JsonValidatorSchema;
}

export type JsonRegExpValidation = RegExp | {regexp: RegExp; message: string; };
export type JsonValidatorObjectChildsSchema = { [key: string]: JsonValidatorSchema };
export const JsonValidatorArrayUnique = '';

/**********************
 *
 * Type schemas
 *
 **********************/
// boolean
export interface JsonValidatorAnySchema extends
    JsonValidatorCommonSchema<JsonValidatorType.Any>
{}

// boolean
export interface JsonValidatorBooleanSchema extends
    JsonValidatorCommonSchema<JsonValidatorType.Boolean>
{}

// string
export interface JsonValidatorStringSchema extends
    JsonValidatorCommonSchema<JsonValidatorType.String>,
    JsonValidatorClampLengthSchema
{
    /**
     * RegExp for validate string (valid only for String)
     */
    regexp?: JsonRegExpValidation;

    /**
     * Try parse as new Date() (valid only for String)
     */
    asDate?: boolean;
}

// password
export interface JsonValidatorPasswordSchema extends
    JsonValidatorCommonSchema<JsonValidatorType.String>,
    JsonValidatorClampLengthSchema
{
    /**
     * RegExp for validate string (valid only for String)
     */
    regexp?: JsonRegExpValidation;

    /**
     * Try parse as new Date() (valid only for String)
     */
    asDate?: boolean;
}

// number
export interface JsonValidatorNumberSchema extends
    JsonValidatorCommonSchema<JsonValidatorType.Number>
{
    /**
     * Minimal value of Number
     */
    min?: number;
    /**
     * Maximal value of Number
     */
    max?: number;

    /**
     * Is integer needed (valid only for Number)
     */
    asInteger?: boolean;
}

// enum
export interface JsonValidatorEnumSchema extends
    JsonValidatorCommonSchema<JsonValidatorType.Enum>
{
    /**
     * Possible Enum values (valid only for Enum)
     */
    enum?: string[] | Readonly<string[]>;
}

// array
export interface JsonValidatorArraySchema extends
    JsonValidatorCommonSchema<JsonValidatorType.Array>,
    JsonValidatorClampLengthSchema,
    JsonValidatorCollectionSchema
{
    unique?: string,
}

export enum JsonValidatorAdditionalProperties {
    Reject = 'Reject',
    Remove = 'Remove',
}

// object
export interface JsonValidatorObjectSchema extends
    JsonValidatorCommonSchema<JsonValidatorType.Object>,
    JsonValidatorCollectionSchema
{
    /**
     * Type of Object childs (valid only for Object)
     */
    childs?: JsonValidatorObjectChildsSchema;

    /**
     * RegExp for childs keys (valid only for Object)
     */
    keysRegexp?: JsonRegExpValidation;

    /**
     * Can contains any other properties?
     *
     * Allow - allow additional properties in output
     * Reject - object with additional props is not valid
     * Remove - remove additional properties but keep object valid
     */
    additinalProperties?: JsonValidatorAdditionalProperties;
}

export type JsonValidatorSchema =
    JsonValidatorAnySchema |
    JsonValidatorBooleanSchema |
    JsonValidatorStringSchema |
    JsonValidatorNumberSchema |
    JsonValidatorEnumSchema |
    JsonValidatorArraySchema |
    JsonValidatorObjectSchema;

export type GetOf<T extends JsonValidatorArraySchema> = T['of'];
export type GetOfType<T extends JsonValidatorArraySchema> = T['of']['type'];
export type GetChilds<T extends JsonValidatorObjectSchema> = T['childs'];
export type GetEnum<T extends JsonValidatorEnumSchema> = T['enum'];

export type ConvertObject<T extends JsonValidatorSchema> = T extends JsonValidatorObjectSchema ? GetChilds<T> extends object ? JsonObjectFromSchema<GetChilds<T>> : TypeOfJsonValidatorType[T['type']] : TypeOfJsonValidatorType[T['type']];
export type ConvertFunction<T extends JsonValidatorSchema> = T['outputTransform'] extends JsonValidatorTransformFunction<any> ? ReturnType<T['outputTransform']> : never;
export type ConvertEnum<T extends JsonValidatorSchema> = T extends JsonValidatorEnumSchema ? GetEnum<T> extends Readonly<string[]> ? GetEnum<T>[number] : TypeOfJsonValidatorType[T['type']] : TypeOfJsonValidatorType[T['type']];

export type ConvertComplete<T extends JsonValidatorSchema> =
    T['outputTransform'] extends JsonValidatorTransformFunction<any>
        ? ReturnType<T['outputTransform']>
        : T extends JsonValidatorArraySchema
            ? GetOf<T> extends object
                ? GetOf<T> extends JsonValidatorObjectSchema
                    ? TypeOfJsonValidatorType<ConvertObject<GetOf<T>>>[T['type']]
                    : TypeOfJsonValidatorType<TypeOfJsonValidatorType[GetOfType<T>]>[T['type']]
                : TypeOfJsonValidatorType[T['type']]
            : T extends JsonValidatorObjectSchema
                ? ConvertObject<T>
                : T extends JsonValidatorEnumSchema
                    ? ConvertEnum<T>
                    : TypeOfJsonValidatorType[T['type']];



export type OnlyRequiredKeys<T extends JsonValidatorObjectChildsSchema> = {
    [K in keyof T]: T[K]['required'] extends JsonValidatorRequired.True ? K : never;
}[keyof T];

export type OnlyOptionalKey<T extends JsonValidatorObjectChildsSchema> = {
    [K in keyof T]?: T[K]['required'] extends JsonValidatorRequired.True ? never : K;
}[keyof T];

export type RequiredChilds<T extends JsonValidatorObjectChildsSchema> = {
    [K in keyof T]: ConvertComplete<T[K]>;
};

export type OptionalChilds<T extends JsonValidatorObjectChildsSchema> = {
    [K in keyof T]?: ConvertComplete<T[K]>;
};

// output type
export type JsonObjectFromSchema<T extends JsonValidatorObjectChildsSchema> = RequiredChilds<Pick<T, OnlyRequiredKeys<T>>> & OptionalChilds<Pick<T, OnlyOptionalKey<T>>>;

/**********************************************
 *
 * Quick functions
 *
 **********************************************/
export function required<T extends JsonValidatorSchema>(input: T): T {
    return {
        ...(input as any),
        required: JsonValidatorRequired.True,
    };
}

/**********************************************
 *
 * Validator class
 *
 **********************************************/
export class JsonValidator {
    /**
     * Helper for validate body by format object
     * Returns validated body or null
     * Throws:
     *  ValidatorError - for any problem with body data
     *  Error - for errors in format specification
     *
     * @param body
     * @param format
     */
    public static objectValidator<T extends JsonValidatorObjectChildsSchema>(
        input: any,
        schema: T,
        additinalProperties: JsonValidatorAdditionalProperties = JsonValidatorAdditionalProperties.Remove,
    ): JsonObjectFromSchema<T> {

        if (!input) {
            throw new JsonValidationError('Object is empty');
        }

        if (!isObject(input) || isArray(input)) {
            throw new JsonValidationError('Input is not object');
        }

        return JsonValidator.validate(
            input,
            {
                type: JsonValidatorType.Object,
                childs: schema,
                additinalProperties,
            },
        );
    }

    /**
     * Validate key with name by schema
     * @param content
     * @param schema
     * @param parentKey
     * @param key
     */
    public static validate(
        content: any,
        schema: JsonValidatorSchema,
        parentKey: string = '',
        key: string = '',
    ): any {
        const validators = {
            [JsonValidatorType.Any]: JsonValidator.validateAny,
            [JsonValidatorType.Boolean]: JsonValidator.validateBoolean,
            [JsonValidatorType.String]: JsonValidator.validateString,
            [JsonValidatorType.Password]: JsonValidator.validatePassword,
            [JsonValidatorType.Number]: JsonValidator.validateNumber,
            [JsonValidatorType.Enum]: JsonValidator.validateEnum,
            [JsonValidatorType.Array]: JsonValidator.validateArray,
            [JsonValidatorType.Object]: JsonValidator.validateObject,
        };
        if (validators[schema.type]) {
            if (content === null && schema.nullable) {
                return null;
            }
            if (isFunction(schema.parseTransform)) {
                content = schema.parseTransform(content);
            }
            let output = validators[schema.type](parentKey, key, content, schema as any);
            if (isFunction(schema.outputTransform)) {
                output = schema.outputTransform(output);
            }
            return output;
        }
        throw new Error(`Type ${schema.type} is not supported`);
    }

    /**
     * Any type validator
     * @param parentKey
     * @param key
     * @param content
     * @param schema
     */
    protected static validateAny(
        parentKey: string,
        key: string,
        content: any,
        schema: JsonValidatorAnySchema,
    ): any {
        return content;
    }

    /**
     * Boolean type validator
     * @param parentKey
     * @param key
     * @param content
     * @param schema
     */
    protected static validateBoolean(
        parentKey: string,
        key: string,
        content: any,
        schema: JsonValidatorBooleanSchema,
    ): any {
        if (isBoolean(content)) {
            return content;
        }
        throw new JsonValidationFieldError([{
            field: `${parentKey}${key}`,
            message: `Must be boolean`,
            humanKeyName: schema.humanKeyName,
            fieldDescription: schema.description,
        }]);
    }

    /**
     * String type validator
     * @param parentKey
     * @param key
     * @param content
     * @param schema
     */
    protected static validateString(
        parentKey: string,
        key: string,
        content: any,
        schema: JsonValidatorStringSchema,
    ) : any {
        if (isString(content)) {
            // min length
            if (!isUndefined(schema.minLength)) {
                if (content.length < schema.minLength) {
                    throw new JsonValidationFieldError([{
                        field: `${parentKey}${key}`,
                        message: `Minimal length is ${schema.minLength}`,
                        humanKeyName: schema.humanKeyName,
                        fieldDescription: schema.description,
                    }]);
                }
            }
            // max length
            if (!isUndefined(schema.maxLength)) {
                if (content.length > schema.maxLength) {
                    throw new JsonValidationFieldError([{
                        field: `${parentKey}${key}`,
                        message: `Maximal length is ${schema.maxLength}`,
                        humanKeyName: schema.humanKeyName,
                        fieldDescription: schema.description,
                    }]);
                }
            }
            // regexp
            if (schema.regexp) {
                // prepare regexp and message
                let regExp: RegExp = null;
                let message: string = `Doesn't match validation RegExp`;
                if (isRegExp(schema.regexp)) {
                    regExp = schema.regexp;
                } else {
                    regExp = schema.regexp.regexp;
                    message = schema.regexp.message;
                }

                // test it
                if (regExp.test(content)) {
                    // date parser
                    if (schema.asDate) {
                        const date = new Date(content);
                        if (!isDate(date) || isNaN(date.getTime())) {
                            throw new JsonValidationFieldError([{
                                field: `${parentKey}${key}`,
                                message: `Invalid date value`,
                                humanKeyName: schema.humanKeyName,
                                fieldDescription: schema.description,
                            }]);
                        }
                        return date;
                    } else {
                        return content;
                    }
                } else {
                    // schema not matched
                    throw new JsonValidationFieldError([{
                        field: `${parentKey}${key}`,
                        message,
                        humanKeyName: schema.humanKeyName,
                        fieldDescription: schema.description,
                    }]);
                }
            } else { // equal match
                // date parser
                if (schema.asDate) {
                    const date = new Date(content);
                    if (!(date instanceof Date) || isNaN(date.getTime())) {
                        throw new JsonValidationFieldError([{
                            field: `${parentKey}${key}`,
                            message: `Invalid date value`,
                            humanKeyName: schema.humanKeyName,
                            fieldDescription: schema.description,
                        }]);
                    }
                    return date;
                } else {
                    return content;
                }
            }
        }
        throw new JsonValidationFieldError([{
            field: `${parentKey}${key}`,
            message: `Must be string`,
            humanKeyName: schema.humanKeyName,
            fieldDescription: schema.description,
        }]);
    }

    /**
     * Password type validator
     * @param parentKey
     * @param key
     * @param content
     * @param schema
     */
     protected static validatePassword(
        parentKey: string,
        key: string,
        content: any,
        schema: JsonValidatorPasswordSchema,
    ) : any {
        return JsonValidator.validateString(parentKey, key, content, schema);
    }

    /**
     * Number type validator
     * @param parentKey
     * @param key
     * @param content
     * @param schema
     */
    protected static validateNumber(
        parentKey: string,
        key: string,
        content: any,
        schema: JsonValidatorNumberSchema,
    ): any {
        if (isNumber(content) && !isNaN(content)) {
            // check min value
            if (!isUndefined(schema.min)) {
                if (content < schema.min) {
                    throw new JsonValidationFieldError([{
                        field: `${parentKey}${key}`,
                        message: `Minimal value is ${schema.min}`,
                        humanKeyName: schema.humanKeyName,
                        fieldDescription: schema.description,
                    }]);
                }
            }
            // check max value
            if (!isUndefined(schema.max)) {
                if (content > schema.max) {
                    throw new JsonValidationFieldError([{
                        field: `${parentKey}${key}`,
                        message: `Maximal value is ${schema.max}`,
                        humanKeyName: schema.humanKeyName,
                        fieldDescription: schema.description,
                    }]);
                }
            }
            if (schema.asInteger && !Number.isInteger(content)) {
                throw new JsonValidationFieldError([{
                    field: `${parentKey}${key}`,
                    message: `Must be integer, not float`,
                    humanKeyName: schema.humanKeyName,
                    fieldDescription: schema.description,
                }]);
            }
            return content;
        }
        throw new JsonValidationFieldError([{
            field: `${parentKey}${key}`,
            message: `Must be number`,
            humanKeyName: schema.humanKeyName,
            fieldDescription: schema.description,
        }]);
    }

    /**
     * Enum type validator
     * @param parentKey
     * @param key
     * @param content
     * @param schema
     */
    protected static validateEnum(
        parentKey: string,
        key: string,
        content: any,
        schema: JsonValidatorEnumSchema,
    ): any {
        if (!isArray(schema.enum)) {
            throw new Error(`Missing 'enum' field in '${parentKey}${key}' format`);
        }
        if (isString(content) && (schema.enum.indexOf(content) > -1)) {
            return content;
        }
        throw new JsonValidationFieldError([{
            field: `${parentKey}${key}`,
            message: `Must be one of following values [${schema.enum}]`,
            humanKeyName: schema.humanKeyName,
            fieldDescription: schema.description,
        }]);
    }

    /**
     * Array type validator
     * @param parentKey
     * @param key
     * @param content
     * @param schema
     * @param keyName
     */
    protected static validateArray(
        parentKey: string,
        key: string,
        content: any,
        schema: JsonValidatorArraySchema,
    ): any {
        if (!schema.of) {
            throw new Error(`Missing 'of' field in '${parentKey}${key}' format`);
        }
        if (isArray(content)) {
            // min length
            if (!isUndefined(schema.minLength)) {
                if (content.length < schema.minLength) {
                    throw new JsonValidationFieldError([{
                        field: `${parentKey}${key}`,
                        message: `Must have minimal length of ${schema.minLength} items`,
                        humanKeyName: schema.humanKeyName,
                        fieldDescription: schema.description,
                    }]);
                }
            }
            // max length
            if (!isUndefined(schema.maxLength)) {
                if (content.length > schema.maxLength) {
                    throw new JsonValidationFieldError([{
                        field: `${parentKey}${key}`,
                        message: `Must have maximal length of ${schema.maxLength} items`,
                        humanKeyName: schema.humanKeyName,
                        fieldDescription: schema.description,
                    }]);
                }
            }

            // validate items
            const acumulatedErrors = [];

            // find duplicities
            if (isString(schema.unique)) {
                findDuplicities(content, schema.unique)
                    .forEach((index) => {
                        acumulatedErrors.push({
                            field: `${parentKey}${key}[${index}]${schema.unique ? '.' + schema.unique : schema.unique}`,
                            message: `Items must be unique`,
                            humanKeyName: schema.humanKeyName,
                        })
                    });
            }

            // accumulate errors
            content.forEach((item, index) => {
                try {
                    JsonValidator.validate(item, schema.of, `${parentKey}${key}`, `[${index}]`);
                } catch (e) {
                    if (e instanceof JsonValidationFieldError) {
                        acumulatedErrors.push(e.details);
                    } else {
                        throw e;
                    }
                }
            });

            // throw accumulated errors for all items
            if (acumulatedErrors.length) {
                throw new JsonValidationFieldError(flatten(acumulatedErrors));
            }
            return content;
        }
        throw new JsonValidationFieldError([{
            field: `${parentKey}${key}`,
            message: `Must be array`,
            humanKeyName: schema.humanKeyName,
            fieldDescription: schema.description,
        }]);
    }

    /**
     * Object type validator
     * @param parentKey
     * @param key
     * @param content
     * @param schema
     */
    protected static validateObject(
        parentKey: string,
        key: string,
        content: any,
        schema: JsonValidatorObjectSchema,
    ) {
        if ((!schema.childs || !isObject(schema.childs)) && (!schema.of)) {
            throw new Error(`Missing 'childs' or 'of' field in '${parentKey}${key}' format`);
        }
        if (isObject(content) && !isArray(content)) {
            const objKeys = schema.childs ? Object.keys(schema.childs) : Object.keys(content);
            const outObject = {};

            // for each property
            const acumulatedErrors = [];
            objKeys.forEach((objKey) => {
                try {
                    let newParentKey = `${parentKey}${key}.`;
                    if (newParentKey === '.') {
                        newParentKey = '';
                    }

                    // test regexp for property name
                    if (schema.keysRegexp) {
                        let regExp: RegExp = null;
                        let message: string = `Doesn't match validation RegExp`;
                        if (schema.keysRegexp instanceof RegExp) {
                            regExp = schema.keysRegexp;
                        } else {
                            regExp = schema.keysRegexp.regexp;
                            message = schema.keysRegexp.message;
                        }

                        if (!regExp.test(objKey)) {
                            throw new JsonValidationFieldError([{
                                field: `${parentKey}${key}.${objKey}`,
                                isOnKey: true,
                                message,
                                fieldDescription: schema.description,
                            }]);
                        }
                    }

                    // validate content of property
                    if (!isUndefined(content[objKey])) {
                        outObject[objKey] = JsonValidator.validate(
                            content[objKey],
                            (schema.childs ? schema.childs[objKey] : schema.of),
                            newParentKey,
                            objKey,
                        );
                    } else if (schema.childs && schema.childs[objKey].required === JsonValidatorRequired.True) {
                        // was undefined, and is required
                        throw new JsonValidationFieldError([{
                            field: `${newParentKey}${objKey}`,
                            message: `Missing required field`,
                            humanKeyName: schema.humanKeyName,
                            fieldDescription: schema.description,
                        }]);
                    }
                } catch (e) {
                    if (e instanceof JsonValidationFieldError) {
                        acumulatedErrors.push(e.details);
                    } else {
                        throw e;
                    }
                }
            });

            // throw accumulated errors for all properties
            if (acumulatedErrors.length) {
                throw new JsonValidationFieldError(flatten(acumulatedErrors));
            }

            const additinalProperties = schema.additinalProperties ? schema.additinalProperties : JsonValidatorAdditionalProperties.Remove;

            // throw additional error
            // only for reject - most strict mode
            if (additinalProperties === JsonValidatorAdditionalProperties.Reject) {
                const keysContent = Object.keys(content);
                const keysOut = Object.keys(outObject);
                if (keysContent.length > keysOut.length) {
                    const diff = arrayDiff(keysContent, keysOut);
                    throw new JsonValidationFieldError(
                        diff.map((additionalKey: string) => ({
                            field: `${parentKey}${key}.${additionalKey}`,
                            message: `Additional keys is not allowed`,
                            humanKeyName: schema.humanKeyName,
                            fieldDescription: schema.description,
                        })),
                    );
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
            fieldDescription: schema.description,
        }]);
    }
}

/**********************
 *
 * Json validator utils
 *
 **********************/
export class JsonValidatorUtils {
    /**
     * Get all posible keys until finalType is reached in every branches of schema.
     * @param schema
     * @param finalTypes
     * @returns
     */
    public static getAllKeys(
        schema: JsonValidatorSchema,
        finalTypes: JsonValidatorType[] = [
            JsonValidatorType.Any,
            JsonValidatorType.Boolean,
            JsonValidatorType.Number,
            JsonValidatorType.String,
            JsonValidatorType.Enum,
        ],
    ): {[key: string]: JsonValidatorSchema} {
        return JsonValidatorUtils.internalGetAllKeys(schema, finalTypes);
    }

    /**
     * Internal recursion to get all keys from schema
     * @param schema
     * @param finalTypes
     * @param acc
     * @param prefix
     * @returns
     */
    protected static internalGetAllKeys(
        schema: JsonValidatorSchema,
        finalTypes: JsonValidatorType[],
        acc: {[key: string]: JsonValidatorSchema} = {},
        prefix: string = '',
    ): {[key: string]: JsonValidatorSchema} {
        if (finalTypes.includes(schema.type)) {
            acc[prefix] = schema;
            return acc;
        } else if (schema.type === JsonValidatorType.Object) {
            const keys = Object.keys(schema.childs);
            keys.forEach(key => JsonValidatorUtils.internalGetAllKeys(
                schema.childs[key],
                finalTypes,
                acc,
                `${prefix ? prefix + '.' : ''}${schema.childs[key].required !== JsonValidatorRequired.True ? '?' : ''}${key}`,
            ));
            return acc;
        } else if (schema.type === JsonValidatorType.Array) {
            JsonValidatorUtils.internalGetAllKeys(
                schema.of,
                finalTypes,
                acc,
                `${prefix}[]`,
            );
            return acc;
        }
        return acc;
    }
}