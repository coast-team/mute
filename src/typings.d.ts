// Typings reference file, you can add your own global typings here
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

declare var System: any

// Logging frameworks global variables
declare var log: Log
declare var BRAGI: any

declare module 'mute-structs'
declare module 'netflux'
declare module 'random-material-color'

// FIXME: Maybe temporarly issue
// interface Map<K, V> {
//     clear(): void;
//     delete(key: K): boolean;
//     forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;
//     get(key: K): V;
//     has(key: K): boolean;
//     set(key: K, value: V): Map<K, V>;
//     size: number;
// }
// declare var Map: {
//     new <K, V>(): Map<K, V>;
//     prototype: Map<any, any>;
// }
// interface Set<T> {
//     add(value: T): Set<T>;
//     clear(): void;
//     delete(value: T): boolean;
//     forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;
//     has(value: T): boolean;
//     size: number;
// }
// declare var Set: {
//     new <T>(): Set<T>;
//     prototype: Set<any>;
// }
