export interface BasicTypes {
    string: string;
    number: number;
    boolean: boolean;
}

export type PrimitiveOrConstructor = (new (...args: any[]) => any) | keyof BasicTypes;
export type GuardedType<T extends PrimitiveOrConstructor> = T extends (new(...args: any[]) => infer U) ? U : T extends keyof BasicTypes ? BasicTypes[T] : never;

/**
 * Is ref instance of t or basic type t
 *
 * @param ref Reference to value
 * @param t reference object or basic type
 * @returns true if ref is instance of t or basic type t
 */
export function typeGuard<T extends PrimitiveOrConstructor>(ref: any, t: T): ref is GuardedType<T> {
    const localPrimitiveOrConstructor: PrimitiveOrConstructor = t;
    if (typeof localPrimitiveOrConstructor === 'string') {
        return typeof ref === localPrimitiveOrConstructor;
    }
    return ref instanceof localPrimitiveOrConstructor;
}

/**
 * Check if reference is to object and value is not null
 *
 * @param ref Reference to value
 * @returns true if ref is object
 */
export function isObject<T extends object = object>(ref: any): ref is T {
    return typeof ref === 'object' && ref !== null;
}

/**
 * Check if reference is to object, value is not null and is instance of T
 *
 * @param ref Reference to value
 * @param t reference object
 * @returns true if ref is object
 */
export function isObjectInstance<T extends Object>(ref: any, t: new () => T): ref is T {
    return typeof ref === 'object' && ref !== null && ref instanceof t;
}

/**
 * Check if reference is data object and value is not null
 *
 * @param ref Reference to value
 * @returns true if ref is data object
 */
export function isDataObject(ref: any): ref is object {
    // tslint:disable-next-line: strict-comparisons
    return typeof ref === 'object' && ref !== null && ref.constructor === Object;
}

/**
 * Check if refence is to string.
 *
 * @param ref Reference to value
 * @returns true if ref is string
 */
export function isString(ref: any): ref is string {
    return typeof ref === 'string';
}

/**
 * Check if refence is to number.
 *
 * @param ref Reference to value
 * @returns true if ref is number
 */
export function isNumber(ref: any): ref is number {
    return typeof ref === 'number';
}

/**
 * Check if refence is to boolean.
 *
 * @param ref Reference to value
 * @returns true if ref is boolean
 */
export function isBoolean(ref: any): ref is boolean {
    return typeof ref === 'boolean';
}

/**
 * Check if refence is to function.
 *
 * @param ref Reference to value
 * @returns true if ref is function
 */
export function isFunction(ref: any): ref is (...a: any[]) => any {
    return typeof ref === 'function';
}

/**
 * Check if reference is to object that is instance of date.
 *
 * @param ref Reference to value
 * @returns true if ref is instance of date
 */
export function isDate(ref: any): ref is Date {
    return ref instanceof Date;
}

/**
 * Check if reference is to object that is instance of buffer.
 *
 * @param ref Reference to value
 * @returns true if ref is instance of buffer
 */
export function isBuffer(ref: any): ref is Buffer {
    return ref instanceof Buffer;
}

/**
 * Check if reference is array
 *
 * @param ref Reference to value
 * @returns true if ref is array
 */
export function isArray<T>(ref: any): ref is T[] {
    return Array.isArray(ref);
}

/**
 * Check if reference is error instance
 *
 * @param ref Reference to value
 * @returns true if ref is error instance
 */
export function isError(ref: any): ref is Error {
    return ref instanceof Buffer;
}

/**
 * Check if reference is undefined
 *
 * @param ref Reference to value
 * @returns true if ref is undefined
 */
export function isUndefined(ref: any): ref is undefined {
    return typeof ref === 'undefined';
}

/**
 * Check if reference is not undefined or null
 *
 * @param ref Reference to value
 * @returns true if ref is not undefined or null
 */
export function isSet(ref: any): boolean {
    return ref !== null && !isUndefined(ref);
}

/**
 * Is array items instance of t
 *
 * @param ref Reference to value
 * @param t reference object
 * @returns true if ref is array
 */
export function isArrayInstancesOf<T extends Object>(ref: any, t: new () => T): ref is T[] {
    return Array.isArray(ref) && !ref.some((value) => !(value instanceof t));
}

/**
 * Is array items instance of t
 *
 * @param ref Reference to value
 * @param t reference object
 * @returns true if ref is array
 */
export function isArrayTypeGuard<T extends PrimitiveOrConstructor>(ref: any, t: T): ref is GuardedType<T>[] {
    return Array.isArray(ref) && !ref.some((value) => !(typeGuard(value, t)));
}

/**
 * Check if reference is regexp
 *
 * @param ref Reference to value
 * @returns true if ref is regexp
 */
export function isRegExp(ref: any): ref is RegExp {
    return ref instanceof RegExp;
}

/*
* Complex validators
*/

/**
 * Check object, if include all keys from keys array.
 *
 * @param ref Reference to object
 * @param keys Array of keys
 * @returns true if object does not contains all keys
 */
export function objectHasKeys(ref: object, keys: string[]): ref is object {
    const objectKeys = Object.keys(ref);
    return keys.every((value) => objectKeys.indexOf(value) >= 0);
}

/**
 * True, if array contains all values
 */
 export function arrayContainsValues(array: any[], values: any[]): boolean {
    if (!values) {
        return true;
    }
    return values.every(v => array.includes(v));
}

/**
 * True, if array contains one of values
 */
 export function arrayContainsOneOfValue(array: any[], values: any[]): boolean {
    if (!values) {
        return true;
    }
    return values.some(v => array.includes(v));
}