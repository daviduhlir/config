export declare function safe<T>(expression: () => T, defaultValue: any): any;
export declare function notNull<T>(value: T): T;
export declare function notNaN<T>(value: T): T & number;
