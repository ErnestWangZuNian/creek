import { request } from '@creek/request';


export const getStoreService = () => {
  return request('/v2/store/inventory', {
    method: 'get',
  });
};
