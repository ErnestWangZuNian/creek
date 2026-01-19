// @ts-ignore
/* eslint-disable */
import { request } from '@creekjs/request';

/** 新建店铺 创建一个新店铺 POST /catering/stores/add */
export async function createStore(body: API.Store, options?: { [key: string]: any }) {
  return request<API.ResultVoid>('/catering/stores/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询所有店铺 返回所有店铺列表 GET /catering/stores/all */
export async function getAllStores(options?: { [key: string]: any }) {
  return request<API.ResultListStore>('/catering/stores/all', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 删除店铺 根据ID删除店铺 DELETE /catering/stores/delete/${param0} */
export async function deleteStore(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteStoreParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultVoid>(`/catering/stores/delete/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 分页查询店铺 分页返回店铺列表 GET /catering/stores/page */
export async function getStoresPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getStoresPageParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultIPageStore>('/catering/stores/page', {
    method: 'GET',
    params: {
      // page has a default value: 1
      page: '1',
      // size has a default value: 10
      size: '10',
      ...params,
    },
    ...(options || {}),
  });
}

/** 修改店铺 根据ID修改店铺信息 PUT /catering/stores/update */
export async function updateStore(body: API.Store, options?: { [key: string]: any }) {
  return request<API.ResultVoid>('/catering/stores/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
