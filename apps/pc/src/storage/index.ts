
import { createStore } from '@creek/cache';

export const userStore = createStore<string>("sessionStorage", {
    namespace: 'user',
})
