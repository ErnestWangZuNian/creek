import { StorageOptions } from "./common";
import { localStorage } from './localStorage';
import { sessionStorage } from './sessionStorage';
import { createCreekStore } from './storeEngine';

export type storageType = 'localStorage' | 'sessionStorage' | 'lruCache';

export function createStore<T>(storage: storageType = 'localStorage', options: StorageOptions = {}) {

    switch (storage) {
        case 'localStorage':
            return createCreekStore<T>(localStorage, options);
        case 'sessionStorage':
            return createCreekStore(sessionStorage, options);

    }

}