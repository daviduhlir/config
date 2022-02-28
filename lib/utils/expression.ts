import { flatten } from './array';
import { safe } from './safe';
import { replaceAll } from './string';

/**
 * Prepare string expression
 * @param exp
 */
function prepareExpression(exp: string): string {
    const cleanExp = replaceAll(exp, '\\?\\.', '');
    const reg = /(\[\'([^\[\]\"]+)\'\]|\[\"([^\[\]\"]+)\"\]|\[([^\.\[\]\"]+)\]|([^\.\[\]\"]+))/g;
    const out = [];
    let match = null;
    while ((match = reg.exec(cleanExp)) !== null) {
        for (let i = 5; i > 0; i--) {
            if (match[i]) {
                out.push(match[i]);
                break;
            }
        }
    }
    return out
        .map((t) => '["' + t + '"]')
        .join('');
}

function getNumberFromAny(value: any): number {
    const val = parseInt(value, 10);
    if (isNaN(val) || val.toString().length !== value.toString().length) {
        return null;
    }
    return val;
}

/**
 * Add missings objects
 * @param object
 * @param exp
 */
function addMissings(object: any, exp: string) {
    const parts = replaceAll(exp, '"', '').split(/\[([^\[\]]*)\]/).filter((part) => part.length);
    let pointer = object;
    for (let i = 0; i < parts.length - 1; i++) {
        if (typeof pointer[parts[i]] === 'undefined' || pointer[parts[i]] === null) {
            const numberIndexNext = getNumberFromAny(parts[i + 1]);
            if (numberIndexNext === null) {
                pointer[parts[i]] = {};
            } else {
                pointer[parts[i]] = [];
            }
        }
        pointer = pointer[parts[i]];
    }
}

/**
 * Get value from object by expression (name seperated by ".")
 * @param object
 * @param exp
 */
export function getByExpression(object: any, exp: string) {
    const arrayParts = exp.split('[]');

    if (arrayParts.length === 1) {
        const preparedExp = prepareExpression(exp);
        // tslint:disable-next-line:prefer-const
        let i: any = undefined;
        // tslint:disable-next-line:no-eval
        safe(() => eval('i = object' + preparedExp), undefined);
        return i;
    } else {
        return flatten(getArrayResultbyExpression(object, arrayParts));
    }
}

/**
 * Get all posible variants by empty []
 * @param object
 * @param exps
 * @returns
 */
export function getArrayResultbyExpression(object: any, exps: string[]) {
    if (exps.length === 1) {
        return getByExpression(object, exps[0]);
    }

    const preparedExp = prepareExpression(exps[0]);
    return getByExpression(object, preparedExp)
        .map((value) => getArrayResultbyExpression(value, exps.slice(1)))
}

/**
 * Set value to object by expression (name seperated by ".")
 * @param object
 * @param exp
 */
export function setByExpression(object: any, exp: string, value: any) {
    const preparedExp = prepareExpression(exp);
    addMissings(object, preparedExp);
    // tslint:disable-next-line:no-eval
    safe(() => eval('object' + preparedExp + '= value'), undefined);
}

/**
 * Get first property from expression
 * @param expression
 */
export function getFirstProperty(expression: string): string {
    return expression.split('.')[0].split('[')[0];
}
