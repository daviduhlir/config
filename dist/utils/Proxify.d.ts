export declare class ProxifyError extends Error {
    constructor(msg: string);
}
export declare class Proxify {
    static wrap<T extends Object>(o: T): T;
    static ignore(o: Object): any;
}
