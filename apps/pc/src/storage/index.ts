
import { createStore } from '@creek/cache';

export const userLruCache = createStore<{ name: string, age: number }>('lruCache', {
    namespace: 'user',
    ttl: 1000 * 60
})
