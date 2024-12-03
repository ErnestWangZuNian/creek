// 类型定义
export interface CreekStorage<T> {
    read(key: string): T | undefined;
    write(key: string, value: string): void;
    remove(key: string): void;
    clearAll(): void;
    each(callback: (key: string, value: T) => void): void;
}

export interface StorageOptions {
    namespace?: string;
}

export interface Store<T> {
    get: (key: string, defaultValue?: T) => T | undefined;
    set: (key: string, value: T) => void;
    remove: (key: string) => void;
    clearAll: () => void;
    each: (callback: (key: string, value: T) => void) => void;
}

export const CREEK_STORE = 'CREEK_STORE';

export const Global = (typeof window !== 'undefined' ? window : global);