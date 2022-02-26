/**
 * Capitalize string
 * @param input
 * @param locale
 */
export function capitalize(input: string, locale?: string): string {
    const parts = input.split(' ');
    return parts.map((part) => {
        const firstChar = locale ? (part.charAt(0).toLocaleUpperCase as any)(locale) : part.charAt(0).toUpperCase();
        return firstChar + part.slice(1).toLowerCase();
    }).join(' ');
}

/**
 * To upper
 * @param input
 * @param locale
 */
export function toUpper(input: string, locale?: string): string {
    return locale ? (input.toLocaleUpperCase as any)(locale) : input.toUpperCase();
}

/**
 * To lower
 * @param input
 * @param locale
 */
export function toLower(input: string, locale?: string): string {
    return locale ? (input.toLocaleLowerCase as any)(locale) : input.toLowerCase();
}

/**
 * Get last char from input
 * @param input
 */
export function lastChar(input: string): string {
    return input.substr(-1);
}

/**
 * Replace all occurence in string
 * @param input
 * @param search
 * @param replacement
 */
export function replaceAll(input: string, search: string, replacement: string): string {
    return input.replace(new RegExp(search, 'g'), replacement);
}
