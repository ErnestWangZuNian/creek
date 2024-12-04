import { StorageOptions } from "./common";
import { localStorage } from './localStorage';
import { createLruCache } from './lruCache';
import { sessionStorage } from './sessionStorage';
import { createCreekStore } from './storeEngine';

export type storageType = 'localStorage' | 'sessionStorage' | 'lruCache';

export function createStore<T>(storage: storageType = 'localStorage', options: StorageOptions<T> = {}) {

    switch (storage) {
        case 'localStorage':
            return createCreekStore<T>(localStorage, options);
        case 'sessionStorage':
            return createCreekStore<T>(sessionStorage, options);
        case 'lruCache': {
            const lruCache = createLruCache<T>(options)
            return createCreekStore<T>(lruCache, options);
        }

    }

}