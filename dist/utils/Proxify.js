"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Proxify = exports.ProxifyError = void 0;
class ProxifyError extends Error {
    constructor(msg) {
        super(msg);
        this.name = "ProxifyError";
        this.message = msg;
        this.__proto__ = ProxifyError.prototype;
    }
}
exports.ProxifyError = ProxifyError;
class Proxify {
    static wrap(o) {
        let ret = new Proxy(o, {
            set: function (target, property, value) {
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
                }
                else if (descriptor && descriptor.set) {
                    descriptor.set.apply(target, [value]);
                    return true;
                }
                else {
                    throw new ProxifyError('Writing to property ' + property + ' is not alowed');
                }
            },
            get: function (target, property) {
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
                }
                else {
                    out = target[property];
                }
                if (out instanceof Object) {
                    if (!out.__no_proxify__ && !target.__proxify_skip__) {
                        return Proxify.wrap(out);
                    }
                }
                return out;
            },
            apply: function (target, that, args) {
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
            construct: function (target, args) {
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
    static ignore(o) {
        let ret = new Proxy(o, {});
        Object.defineProperty(ret, '__no_proxify__', {
            value: true,
            writable: false,
            enumerable: false,
            configurable: false
        });
        return ret;
    }
}
exports.Proxify = Proxify;
//# sourceMappingURL=Proxify.js.map