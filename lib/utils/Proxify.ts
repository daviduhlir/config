/*
 *
 * Proxify is helper, that wraps output objects to proxy.
 * Its recomended to use this proxy when you
 * have any accessible objects in your library
 *
 */

export class ProxifyError extends Error {
    constructor(msg:string) {
        super(msg);
        this.name = "ProxifyError";
        this.message = msg;

        (<any>this).__proto__ = ProxifyError.prototype;
    }
}
declare const Proxy:any;

export class Proxify {

   /*
    *
    *  Wrap object into proxy object
    *
    */
    public static wrap<T extends Object>(o: T): T {
        let ret = new Proxy(o, {
            //  setter ... writing to property is alowed only, when this property has setter in original object
            set: function(target:any, property:string, value:any) {
                let descriptor = Object.getOwnPropertyDescriptor(target, property);

                if (!descriptor) {
                    let p = target.__proto__;
                    while (!descriptor && p) {
                        descriptor = Object.getOwnPropertyDescriptor(p, property);
                        p = p.__proto__;
                    }
                }

                if ((target.__proxify_skip__) || (property == '__proxify_skip__')) {
                    target[property] = value;
                    return true;
                } else if (descriptor && descriptor.set) {
                    descriptor.set.apply(target, [value]);
                    return true;
                } else {
                    throw new ProxifyError('Writing to property '+property+' is not alowed');
                }
            },

            //  getter modify output. It wrap output object (if output is object) to proxy
            get: function(target:any, property:string) {
                let descriptor = Object.getOwnPropertyDescriptor(target, property);

                if (!descriptor) {
                    let p = target.__proto__;
                    while (!descriptor && p) {
                        descriptor = Object.getOwnPropertyDescriptor(p, property);
                        p = p.__proto__;
                    }
                }

                let out;
                if (descriptor && descriptor.get) {
                    out = descriptor.get.apply(target, []);
                } else {
                    out = target[property];
                }

                if (out instanceof Object) {
                    if (!out.__no_proxify__ && !target.__proxify_skip__) {
                        return Proxify.wrap(out);
                    }
                }
                return out;
            },

            //  wrap return value object (if return value is object) to proxy
            apply: function(target:Function, that:any, args:any[]) {
                that.__proxify_skip__++;
                let out = target.apply(that, args);
                that.__proxify_skip__--;

                if (out instanceof Object) {
                    if (!out.__no_proxify__) {
                        return Proxify.wrap(out);
                    }
                }
                return out;
            },

            //  same as function, but this is contructor.
            construct: function(target:Function, args:any[]) {
                let out = Object.create(target.prototype);
                target.apply(out, args);

                if (out instanceof Object) {
                    if (!out.__no_proxify__) {
                        return Proxify.wrap(out);
                    }
                }
                return out;
            },
        });

        Object.defineProperty(ret, '__proxify_skip__', {
            value: 0,
            writable: true,
            enumerable: false,
            configurable: false
        });

        return ret;
    }

   /*
    *
    * Mark object, that will be ignored in proxify function
    *
    * It will add property __no_proxify__ to object
    */
    public static ignore(o:Object) {
        let ret = new Proxy(o, {});

        // add mark to object
        Object.defineProperty(ret, '__no_proxify__', {
            value: true,
            writable: false,
            enumerable: false,
            configurable: false
        });

        return ret;
    }
}