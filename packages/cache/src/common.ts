// 类型定义

import { LRUCache } from 'lru-cache';

export type LRUCacheOptions<T> = LRUCache.Options<string, T, any>;

export interface CreekStorage {
    read(key: string): string | null;
    write(key: string, value: string): void;
    remove(key: string): void;
    clearAll(): void;
    each(callback: (key: string, value: string) => void): void;
    lruCache?: LRUCache<{}, {}, unknown>
}

export type StorageOptions<T> = Partial<LRUCacheOptions<T>> & {
    namespace?: string;
}

export interface Store<T> {
    get: (key: string, defaultValue?: T) => T | undefined;
    set: (key: string, value: T) => void;
    remove: (key: string) => void;
    clearAll: () => void;
    each: (callback: (key: string, value: string) => void) => void;
    lruCache?: LRUCache<{}, {}, unknown>
}

export const CREEK_STORE = 'CREEK_STORE';

export const Global = (typeof window !== 'undefined' ? window : global);


export function toUpperCase(input: string) {
    return input.toUpperCase();
}