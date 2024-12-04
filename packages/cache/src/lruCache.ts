import { LRUCache } from 'lru-cache';
import { CreekStorage, StorageOptions, } from './common';


export function createLruCache<T>(options: StorageOptions<T>) {
    const cache = new LRUCache(options as unknown as any);

    const result: CreekStorage = {
        read(key: string) {
            const cacheValue = cache.get(key);
            return cacheValue as string;
        },
        write(key: string, value: string) {
            cache.set(key, value);
        },
        remove(key: string) {
            cache.delete(key);
        },
        clearAll() {
            cache.clear();
        },
        each(callback) {
        },
        lruCache: cache

    }

    return result;

}


