// @ts-ignore
/* eslint-disable */
import { request } from '@creekjs/request';

/** 新建分类 创建新的采购分类 POST /catering/categories/add */
export async function createCategory(body: API.IngredientCategory, options?: { [key: string]: any }) {
  return request<API.ResultVoid>('/catering/categories/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除分类 根据ID删除分类 DELETE /catering/categories/delete/${param0} */
export async function deleteCategory(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteCategoryParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ResultVoid>(`/catering/categories/delete/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取分类树 获取指定店铺的采购分类树形结构 GET /catering/categories/tree */
export async function getCategoryTree(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCategoryTreeParams,
  options?: { [key: string]: any },
) {
  return request<API.ResultListIngredientCategory>('/catering/categories/tree', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 修改分类 根据ID修改分类信息 PUT /catering/categories/update */
export async function updateCategory(body: API.IngredientCategory, options?: { [key: string]: any }) {
  return request<API.ResultVoid>('/catering/categories/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
