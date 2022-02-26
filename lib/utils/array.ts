import { isSet } from './typechecks';
import { getByExpression } from './expression';

/**
 * Flatten array to one dimensional array
 * @param arr1
 */
export function flatten(arr: any[]) {
    return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);
}

/**
 * Filter by promise
 * @param array
 * @param callback
 */
export async function asyncFilter<T>(array: T[], callback: (value: T) => boolean) {
    const fail: Symbol = Symbol();
    // tslint:disable-next-line: strict-comparisons
    return (await Promise.all(array.map(async (item) => (await callback(item)) ? item : fail))).filter((i) => i !== fail);
}

/**
 * Get first value, that is true
 * @param array
 */
export function getFirstOf<T>(array: T[]): T {
    for (const i of array) {
        if (isSet(i)) {
            return i;
        }
    }
    return null;
}

/**
 * Make array unique
 * @param array
 */
export function arrayUnique<T>(array: T[]): T[] {
    const a = array.concat();
    for (let i = 0; i < a.length; ++i) {
        for (let j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j]) {
                a.splice(j--, 1);
            }
        }
    }
    return a;
}

/**
 * Make array unique
 * @param array
 */
export function mergeArrays(array1: any[], array2: any[]): any[] {
    return arrayUnique([...array1, ...array2]);
}

/**
 * Get diff of two arrays
 * @param arr1
 * @param arr2
 */
export function arrayDiff(arr1: any[], arr2: any[]): any[] {
    return arr1.filter((x) => !arr2.includes(x));
}

/**
 * Randomize positions in array
 * @param array
 */
export function arrayShuffle(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Find all duplicities
 * @param array
 * @param key
 * @returns
 */
export function findDuplicities(array: any[], key?: string): number[] {
    let notUniques = [];
    array.forEach((item1, index1) => {
        const found = array.findIndex((item2, index2) => {
            if (index1 === index2) {
                return false
            }
            if (key) {
                return getByExpression(item1, key) === getByExpression(item2, key);
            } else {
                return item2 === item1;
            }
        });

        if (found !== -1 && !notUniques.includes(found)) {
            notUniques.push(found);
        }
    })
    return notUniques;
}