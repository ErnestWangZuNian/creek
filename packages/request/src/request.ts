import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { AxiosPluginConfigType } from './plugins/AxiosPlugin';
import { AxiosPluginManager } from './plugins/AxiosPluginManager';

import { DuplicatePluginConfigType, LoadingPluginConfigType } from './plugins';


let requestInstance = axios.create();

// 自动解包并规范化响应类型
// 如果 T 包含 data 字段，则提取 data
// 如果 data 中包含 records (或配置的 listField) 字段，则进一步提取，并组合成 ProTable 需要的格式
// 注意：由于 TypeScript 类型系统不支持运行时变量作为键名，这里我们只能尽可能覆盖常见的字段名
// 或者如果用户需要自定义字段名，可能需要在类型层面做一些手动处理，或者我们约定几个常用的字段名
type NormalizeResponse<T> = T extends { data?: infer Data }
  ? (Data extends { records?: infer Records } ? (Omit<Data, 'records'> & { data: Records; success: boolean }) :
     Data extends { result?: infer Result } ? (Omit<Data, 'result'> & { data: Result; success: boolean }) :
     Data extends { list?: infer List } ? (Omit<Data, 'list'> & { data: List; success: boolean }) :
     Data)
  : T;

interface RequestFunction {
  // 修改泛型定义：返回 Promise<NormalizeResponse<T>>
  <T = any>(url: string, config: AxiosPluginConfigType): Promise<NormalizeResponse<T>>;
  instance: AxiosInstance;
  pluginManager: AxiosPluginManager;
  createInstance: (config?: AxiosRequestConfig & DuplicatePluginConfigType & LoadingPluginConfigType) => RequestFunction;
}

export const request: RequestFunction = (url: string, config: AxiosPluginConfigType) => {
  return requestInstance({
    url,
    ...config,
  });
};

request.instance = requestInstance;

request.pluginManager = new AxiosPluginManager(requestInstance);

request.createInstance = (config?: AxiosRequestConfig) => {
  requestInstance = axios.create(config);
  request.instance = requestInstance;
  request.pluginManager = new AxiosPluginManager(requestInstance);
  return request;
};
