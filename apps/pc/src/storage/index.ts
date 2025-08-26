
import { createStore } from '@creekjs/cache';

export const userStore = createStore<string>("sessionStorage", {
    namespace: 'user',
})
