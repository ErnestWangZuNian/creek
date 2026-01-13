// @ts-ignore
/* eslint-disable */
import { request } from '@creekjs/request';

/** 此处后端没有提供注释 POST /stores/add */
export async function createStore(body: API.Store, options?: { [key: string]: any }) {
  return request<API.ResultVoid>('/stores/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /stores/all */
export async function getAllStores(options?: { [key: string]: any }) {
  return request<API.ResultListStore>('/stores/all', {
    method: 'GET',
    ...(options || {}),
  });
}
