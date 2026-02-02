// @ts-ignore
/* eslint-disable */
import { request } from '@creekjs/request';

/** 此处后端没有提供注释 DELETE /catering/purchases/delete/items/${param0} */
export async function deletePurchaseItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deletePurchaseItemParams,
  options?: { [key: string]: any },
) {
  const { itemId: param0, ...queryParams } = params;
  return request<API.ResultVoid>(`/catering/purchases/delete/items/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /catering/purchases/query/${param0} */
export async function getPurchase(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPurchaseParams,
  options?: { [key: string]: any },
) {
  const { purchaseId: param0, ...queryParams } = params;
  return request<API.ResultPurchases>(`/catering/purchases/query/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /catering/purchases/query/${param0}/all */
export async function getAllPurchasesWithItems(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAllPurchasesWithItemsParams,
  options?: { [key: string]: any },
) {
  const { storeId: param0, ...queryParams } = params;
  return request<API.ResultListPurchaseItems>(`/catering/purchases/query/${param0}/all`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /catering/purchases/query/${param0}/items */
export async function getPurchaseItems(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPurchaseItemsParams,
  options?: { [key: string]: any },
) {
  const { purchaseId: param0, ...queryParams } = params;
  return request<API.ResultListPurchaseItems>(`/catering/purchases/query/${param0}/items`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /catering/purchases/submit/${param0} */
export async function submit(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.submitParams,
  body: API.PurchaseItemDTO[],
  options?: { [key: string]: any },
) {
  const { storeId: param0, ...queryParams } = params;
  return request<API.ResultMapStringObject>(`/catering/purchases/submit/${param0}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PUT /catering/purchases/update/${param0}/items */
export async function updatePurchaseItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updatePurchaseItemParams,
  body: API.PurchaseItemDTO,
  options?: { [key: string]: any },
) {
  const { purchaseId: param0, ...queryParams } = params;
  return request<API.ResultVoid>(`/catering/purchases/update/${param0}/items`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
