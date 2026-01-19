import {
  AxiosPlugin,
  AxiosPluginConfigType,
  AxiosPluginErrorType,
  AxiosPluginResponseType,
} from '@creekjs/request';
import { message } from 'antd';

export interface BackendResult<T = any> {
  code: string | number;
  data: T;
  msg?: string;
  message?: string;
}

export interface BusinessResponsePluginOptions {
  // 分页数据所在的字段名，默认为 'records'
  listField?: string;
  // 总数字段名，默认为 'total'
  totalField?: string;
}

export class BusinessResponsePlugin extends AxiosPlugin {
  
  private options: BusinessResponsePluginOptions;

  constructor(options: BusinessResponsePluginOptions = {}) {
    super();
    this.options = {
      listField: 'records',
      totalField: 'total',
      ...options,
    };
  }

  // 处理请求前的参数映射 (ProTable 兼容)
  beforeRequest(config: AxiosPluginConfigType) {
    if (config.params) {
      const { current, pageSize, ...rest } = config.params;
      // 如果存在 current/pageSize 且不存在 page/size，则进行映射
      if ((current !== undefined || pageSize !== undefined)) {
        config.params = {
          ...rest,
          page: current,
          size: pageSize,
        };
      }
    }
    return config;
  }

  // 处理请求成功后的响应
  afterRequest<T>(response: AxiosPluginResponseType<BackendResult<T>>) {
    const { data: resData } = response;
    
    // 检查是否为后端返回的标准结构
    if (resData && typeof resData === 'object' && 'code' in resData) {
      const { code, msg, message: msgAlt } = resData;
      
      // 兼容 code 为 number 或 string 的情况，以及 000000/0000 成功码
      const successCodes = [200, '200', '0000', '000000'];
      
      if (!successCodes.includes(code)) {
        const errorMsg = msg || msgAlt || '请求失败';
        message.error(errorMsg);
        return Promise.reject(response);
      }

      const finalData = resData.data;

      // 自动识别分页结构并转换 (ProTable 兼容)
      const listField = this.options.listField || 'records';
      const totalField = this.options.totalField || 'total';

      // 如果 data 中包含 listField 数组，则将其映射为 data 字段，并补充 success 字段
      if (finalData && typeof finalData === 'object' && Array.isArray(finalData[listField])) {
        return {
          ...finalData,
          data: finalData[listField], // ProTable 需要 data 为数组
          success: true,              // ProTable 需要 success 为 true
          total: finalData[totalField] || 0,
        };
      }

      // 解包，只返回 data 字段
      return finalData;
    }
    
    // 如果不是标准结构，直接返回原始数据
    return resData;
  }

  // 处理 HTTP 错误（如 404, 500 等）
  onError(error: AxiosPluginErrorType) {
    const errorMsg = error.message || '网络请求错误';
    message.error(errorMsg);
    return Promise.reject(error);
  }
}
