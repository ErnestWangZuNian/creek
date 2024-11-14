import { ApplyPluginsType} from 'umi';
import { getPluginManager } from '../core/plugin';

import type { GucConfig } from './types.d';
import { CURRENT_LANGUAGE_KEY } from '{{{constantsPath}}}'

const gucConfig = {{{ gucConfig }}};

const gucRuntimeConfig: GucConfig  = getPluginManager()?.applyPlugins({
            key: 'guc',
            type: ApplyPluginsType.modify,
            initialValue: {
            },
          });

export const getGucConfig = () => {
  let gucRuntimeEnvConfig = {};
  try {
    if (window.gucRuntimeEnvConfig) {
      gucRuntimeEnvConfig = JSON.parse(window.gucRuntimeEnvConfig);
    }
  } catch (error) {
    console.error(error);
  }
  return {
    ...gucConfig,
    ...gucRuntimeConfig,
    ...gucRuntimeEnvConfig,
    axiosRequestConfig: {
      headers: {
        'Accept-Language': CURRENT_LANGUAGE_KEY,
      },
    }
  }
};
