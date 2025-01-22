import axios from 'axios';

import { cacheAdapter } from './cache-adapter';

axios.defaults.adapter = cacheAdapter(axios.defaults.adapter, {
    enabledByDefault: false
})

