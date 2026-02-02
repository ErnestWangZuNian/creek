// @ts-ignore
/* eslint-disable */
import { request } from '@creekjs/request';

/** 此处后端没有提供注释 POST /catering/ingredients/add */
export async function addIngredient(body: API.Ingredients, options?: { [key: string]: any }) {
  return request<API.ResultVoid>('/catering/ingredients/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /catering/ingredients/delete/${param0} */
export async function deleteIngredient(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteIngredientParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultVoid>(`/catering/ingredients/delete/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /catering/ingredients/import/excel/${param0} */
export async function importIngredientsExcel(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.importIngredientsExcelParams,
  body: {},
  options?: { [key: string]: any },
) {
  const { storeId: param0, ...queryParams } = params;
  return request<API.ResultVoid>(`/catering/ingredients/import/excel/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /catering/ingredients/import/txt/${param0} */
export async function importIngredientsTxt(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.importIngredientsTxtParams,
  body: string,
  options?: { [key: string]: any },
) {
  const { storeId: param0, ...queryParams } = params;
  return request<API.ResultVoid>(`/catering/ingredients/import/txt/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /catering/ingredients/query/${param0} */
export async function getByStore(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getByStoreParams,
  options?: { [key: string]: any },
) {
  const { storeId: param0, ...queryParams } = params;
  return request<API.ResultListIngredients>(`/catering/ingredients/query/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /catering/ingredients/query/${param0}/byName */
export async function searchIngredients(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.searchIngredientsParams,
  options?: { [key: string]: any },
) {
  const { storeId: param0, ...queryParams } = params;
  return request<API.ResultListIngredients>(`/catering/ingredients/query/${param0}/byName`, {
    method: 'GET',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /catering/ingredients/update */
export async function updateIngredient(body: API.Ingredients, options?: { [key: string]: any }) {
  return request<API.ResultVoid>('/catering/ingredients/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
