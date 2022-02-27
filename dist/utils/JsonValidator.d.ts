export declare class ObjectId extends String {
}
export declare class JsonValidationError extends Error {
    constructor(message: string);
}
export interface JsonValidatorFieldErrorDetail {
    field: string;
    message: string;
    isOnKey?: boolean;
    humanKeyName?: string;
}
export declare class JsonValidationFieldError extends JsonValidationError {
    readonly details: JsonValidatorFieldErrorDetail[];
    constructor(details: JsonValidatorFieldErrorDetail[]);
}
export declare const JsonValidatorTransforms: {
    toFloat: JsonValidatorTransformFunction<number>;
    toInteger: JsonValidatorTransformFunction<number>;
    toObjectId: JsonValidatorTransformFunction<ObjectId>;
    toDate: JsonValidatorTransformFunction<Date>;
};
export declare enum JsonValidatorType {
    Any = "Any",
    Boolean = "Boolean",
    Number = "Number",
    String = "String",
    Enum = "Enum",
    Array = "Array",
    Object = "Object"
}
export interface TypeOfJsonValidatorType<OF = any> {
    [JsonValidatorType.Any]: any;
    [JsonValidatorType.String]: string;
    [JsonValidatorType.Array]: OF[];
    [JsonValidatorType.Boolean]: boolean;
    [JsonValidatorType.Enum]: string;
    [JsonValidatorType.Number]: number;
    [JsonValidatorType.Object]: {
        [key: string]: any;
    };
}
export declare type JsonValidatorTransformFunction<T> = (value: any) => T;
export declare enum JsonValidatorRequired {
    True = "True",
    False = "False"
}
export interface JsonValidatorCommonSchema<T> {
    type: T;
    required?: Readonly<JsonValidatorRequired>;
    nullable?: boolean;
    humanKeyName?: string;
    parseTransform?: JsonValidatorTransformFunction<any>;
    outputTransform?: JsonValidatorTransformFunction<any>;
}
export interface JsonValidatorClampLengthSchema {
    minLength?: number;
    maxLength?: number;
}
export interface JsonValidatorCollectionSchema {
    of?: JsonValidatorSchema;
}
export declare type JsonRegExpValidation = RegExp | {
    regexp: RegExp;
    message: string;
};
export declare type JsonValidatorObjectChildsSchema = {
    [key: string]: JsonValidatorSchema;
};
export declare const JsonValidatorArrayUnique = "";
export interface JsonValidatorAnySchema extends JsonValidatorCommonSchema<JsonValidatorType.Any> {
}
export interface JsonValidatorBooleanSchema extends JsonValidatorCommonSchema<JsonValidatorType.Boolean> {
}
export interface JsonValidatorStringSchema extends JsonValidatorCommonSchema<JsonValidatorType.String>, JsonValidatorClampLengthSchema {
    regexp?: JsonRegExpValidation;
    asDate?: boolean;
}
export interface JsonValidatorNumberSchema extends JsonValidatorCommonSchema<JsonValidatorType.Number> {
    min?: number;
    max?: number;
    asInteger?: boolean;
}
export interface JsonValidatorEnumSchema extends JsonValidatorCommonSchema<JsonValidatorType.Enum> {
    enum?: string[] | Readonly<string[]>;
}
export interface JsonValidatorArraySchema extends JsonValidatorCommonSchema<JsonValidatorType.Array>, JsonValidatorClampLengthSchema, JsonValidatorCollectionSchema {
    unique?: string;
}
export declare enum JsonValidatorAdditionalProperties {
    Reject = "Reject",
    Remove = "Remove"
}
export interface JsonValidatorObjectSchema extends JsonValidatorCommonSchema<JsonValidatorType.Object>, JsonValidatorCollectionSchema {
    childs?: JsonValidatorObjectChildsSchema;
    keysRegexp?: JsonRegExpValidation;
    additinalProperties?: JsonValidatorAdditionalProperties;
}
export declare type JsonValidatorSchema = JsonValidatorAnySchema | JsonValidatorBooleanSchema | JsonValidatorStringSchema | JsonValidatorNumberSchema | JsonValidatorEnumSchema | JsonValidatorArraySchema | JsonValidatorObjectSchema;
export declare type GetOf<T extends JsonValidatorArraySchema> = T['of'];
export declare type GetOfType<T extends JsonValidatorArraySchema> = T['of']['type'];
export declare type GetChilds<T extends JsonValidatorObjectSchema> = T['childs'];
export declare type GetEnum<T extends JsonValidatorEnumSchema> = T['enum'];
export declare type ConvertObject<T extends JsonValidatorSchema> = T extends JsonValidatorObjectSchema ? GetChilds<T> extends object ? JsonObjectFromSchema<GetChilds<T>> : TypeOfJsonValidatorType[T['type']] : TypeOfJsonValidatorType[T['type']];
export declare type ConvertFunction<T extends JsonValidatorSchema> = T['outputTransform'] extends JsonValidatorTransformFunction<any> ? ReturnType<T['outputTransform']> : never;
export declare type ConvertEnum<T extends JsonValidatorSchema> = T extends JsonValidatorEnumSchema ? GetEnum<T> extends Readonly<string[]> ? GetEnum<T>[number] : TypeOfJsonValidatorType[T['type']] : TypeOfJsonValidatorType[T['type']];
export declare type ConvertComplete<T extends JsonValidatorSchema> = T['outputTransform'] extends JsonValidatorTransformFunction<any> ? ReturnType<T['outputTransform']> : T extends JsonValidatorArraySchema ? GetOf<T> extends object ? GetOf<T> extends JsonValidatorObjectSchema ? TypeOfJsonValidatorType<ConvertObject<GetOf<T>>>[T['type']] : TypeOfJsonValidatorType<TypeOfJsonValidatorType[GetOfType<T>]>[T['type']] : TypeOfJsonValidatorType[T['type']] : T extends JsonValidatorObjectSchema ? ConvertObject<T> : T extends JsonValidatorEnumSchema ? ConvertEnum<T> : TypeOfJsonValidatorType[T['type']];
export declare type OnlyRequiredKeys<T extends JsonValidatorObjectChildsSchema> = {
    [K in keyof T]: T[K]['required'] extends JsonValidatorRequired.True ? K : never;
}[keyof T];
export declare type OnlyOptionalKey<T extends JsonValidatorObjectChildsSchema> = {
    [K in keyof T]?: T[K]['required'] extends JsonValidatorRequired.True ? never : K;
}[keyof T];
export declare type RequiredChilds<T extends JsonValidatorObjectChildsSchema> = {
    [K in keyof T]: ConvertComplete<T[K]>;
};
export declare type OptionalChilds<T extends JsonValidatorObjectChildsSchema> = {
    [K in keyof T]?: ConvertComplete<T[K]>;
};
export declare type JsonObjectFromSchema<T extends JsonValidatorObjectChildsSchema> = RequiredChilds<Pick<T, OnlyRequiredKeys<T>>> & OptionalChilds<Pick<T, OnlyOptionalKey<T>>>;
export declare function required<T extends JsonValidatorSchema>(input: T): T;
export declare class JsonValidator {
    static objectValidator<T extends JsonValidatorObjectChildsSchema>(input: any, schema: T, additinalProperties?: JsonValidatorAdditionalProperties): JsonObjectFromSchema<T>;
    static validate(content: any, schema: JsonValidatorSchema, parentKey?: string, key?: string): any;
    protected static validateAny(parentKey: string, key: string, content: any, schema: JsonValidatorAnySchema): any;
    protected static validateBoolean(parentKey: string, key: string, content: any, schema: JsonValidatorBooleanSchema): any;
    protected static validateString(parentKey: string, key: string, content: any, schema: JsonValidatorStringSchema): any;
    protected static validateNumber(parentKey: string, key: string, content: any, schema: JsonValidatorNumberSchema): any;
    protected static validateEnum(parentKey: string, key: string, content: any, schema: JsonValidatorEnumSchema): any;
    protected static validateArray(parentKey: string, key: string, content: any, schema: JsonValidatorArraySchema): any;
    protected static validateObject(parentKey: string, key: string, content: any, schema: JsonValidatorObjectSchema): {};
}
