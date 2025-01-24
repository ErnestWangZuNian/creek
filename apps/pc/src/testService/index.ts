import { AxiosPluginManager, DuplicatePlugin } from '@creek/request';
import axios from 'axios';

const instance = axios.create();

const pluginManager = new AxiosPluginManager(instance);
pluginManager.use(new DuplicatePlugin());

export const getStoreService = () => {
  return instance({
    url: '/v2/store/inventory',
    method: 'get',
  });
};
