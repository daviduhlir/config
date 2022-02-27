export declare function flatten(arr: any[]): any;
export declare function asyncFilter<T>(array: T[], callback: (value: T) => boolean): Promise<(Symbol | T)[]>;
export declare function getFirstOf<T>(array: T[]): T;
export declare function arrayUnique<T>(array: T[]): T[];
export declare function mergeArrays(array1: any[], array2: any[]): any[];
export declare function arrayDiff(arr1: any[], arr2: any[]): any[];
export declare function arrayShuffle(array: any[]): void;
export declare function findDuplicities(array: any[], key?: string): number[];
