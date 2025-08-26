import { request } from '@creekjs/request';


export const getStoreService = () => {
  return request('/v2/store/inventory', {
    method: 'get',
  });
};


export const getStoreIdService = () => {
  return request('/v2/pet/findByStatus', {
    method: 'get',
    data: {
      status: 'available'
    }
  });
};

