/// <reference types="node" />
export interface BasicTypes {
    string: string;
    number: number;
    boolean: boolean;
}
export declare type PrimitiveOrConstructor = (new (...args: any[]) => any) | keyof BasicTypes;
export declare type GuardedType<T extends PrimitiveOrConstructor> = T extends (new (...args: any[]) => infer U) ? U : T extends keyof BasicTypes ? BasicTypes[T] : never;
export declare function typeGuard<T extends PrimitiveOrConstructor>(ref: any, t: T): ref is GuardedType<T>;
export declare function isObject<T extends object = object>(ref: any): ref is T;
export declare function isObjectInstance<T extends Object>(ref: any, t: new () => T): ref is T;
export declare function isDataObject(ref: any): ref is object;
export declare function isString(ref: any): ref is string;
export declare function isNumber(ref: any): ref is number;
export declare function isBoolean(ref: any): ref is boolean;
export declare function isFunction(ref: any): ref is (...a: any[]) => any;
export declare function isDate(ref: any): ref is Date;
export declare function isBuffer(ref: any): ref is Buffer;
export declare function isArray<T>(ref: any): ref is T[];
export declare function isError(ref: any): ref is Error;
export declare function isUndefined(ref: any): ref is undefined;
export declare function isSet(ref: any): boolean;
export declare function isArrayInstancesOf<T extends Object>(ref: any, t: new () => T): ref is T[];
export declare function isArrayTypeGuard<T extends PrimitiveOrConstructor>(ref: any, t: T): ref is GuardedType<T>[];
export declare function isRegExp(ref: any): ref is RegExp;
export declare function objectHasKeys(ref: object, keys: string[]): ref is object;
export declare function arrayContainsValues(array: any[], values: any[]): boolean;
export declare function arrayContainsOneOfValue(array: any[], values: any[]): boolean;
