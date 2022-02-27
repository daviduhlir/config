import { JsonValidatorObjectChildsSchema, JsonObjectFromSchema, JsonValidationFieldError } from '../utils/JsonValidator';
export declare class ConfigurationError extends Error {
    constructor(message: string);
}
export declare class ConfigurationValidationError extends Error {
    details: any;
    constructor(e: JsonValidationFieldError);
}
export declare class Configuration<T extends JsonValidatorObjectChildsSchema> {
    protected readonly schema: T;
    static load<T extends JsonValidatorObjectChildsSchema>(schema: T, filepaths: string[]): Promise<Configuration<T>>;
    constructor(schema: T);
    get data(): JsonObjectFromSchema<T>;
    get<K>(key: string): K;
    protected internalData: JsonObjectFromSchema<T>;
    set(key: string, value: any): void;
    protected load(...sources: Partial<JsonObjectFromSchema<T>>[]): void;
    protected validate(): void;
}
