import {
  AxiosPlugin,
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

export class BusinessResponsePlugin extends AxiosPlugin {
  // 处理请求成功后的响应
  afterRequest(response: AxiosPluginResponseType<BackendResult>) {
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

      // 解包，只返回 data 字段
      return {
        ...resData,
        success: true,
      };
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
