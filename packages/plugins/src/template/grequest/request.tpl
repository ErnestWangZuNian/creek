// @ts-nocheck
import { notification } from 'antd';
import { ApplyPluginsType } from 'umi';
import { ICacheLike, cacheAdapterEnhancer } from '{{{axiosExtensionsPath}}}';
import {CURRENT_LANGUAGE_KEY, LanguageEnum} from '{{{constantsPath}}}'
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from '{{{axiosPath}}}';
import { useRequest as useUmiRequest } from '{{{umiRequestPath}}}';
import { getPluginManager } from '../core/plugin';

import {
  Options,
  Service,
  Result
} from '{{{umiRequestPath}}}/es/useRequest/src/types';

type  OptionsWithNoFullApiData<TData, TParams> =  Options<TData, TParams> & {
  formatResult?: (data: TData['result'], params: TParams) =>  TData['result'],
}

type  OptionsWithFullApiData<TData, TParams> =  Options<TData, TParams> & {
  formatResult?: (data: TData, params: TParams) =>  TData,
  needFullApiData: true;
}

function useRequest<
  TData,
  TParams extends any[]
>(
  service:Service<TData, TParams>,
  options?: OptionsWithFullApiData<TData, TParams>,
  plugins?: Plugin<TData, TParams>[]
):Result<TData, TParams>;

function useRequest<
  TData,
  TParams extends any[]
>(
  service:Service<TData, TParams>,
  options?: OptionsWithNoFullApiData<TData, TParams>,
  plugins?: Plugin<TData, TParams>[]
):Result<TData{{{resultDataField}}}, TParams>;

function useRequest<TData,  TParams extends any[]>(  service: Service<TData, TParams>,options?: Options<TData, TParams> = {}) {
  const  resquestResult =  useUmiRequest(service, {
    ...options,
  });
  let needFullApiData =  options['needFullApiData'] ;
  if(options['formatResult']){
    resquestResult.data = options['formatResult'](resquestResult.data, options);
  }
  if(needFullApiData){
   resquestResult.data =  resquestResult.data;
  }else{
     resquestResult.data = resquestResult.data? resquestResult.data['result'] :   resquestResult.data  ;
    }

  return resquestResult;
}

interface IRequestOptions extends AxiosRequestConfig {
  skipErrorHandler?: boolean;
  requestInterceptors?: IRequestInterceptorTuple[];
  responseInterceptors?: IResponseInterceptorTuple[];
  closeMessage?: boolean;
  setCustomMessage?: (error?: AxiosResponse<any, any> & {message: string}, opts?: IRequestOptions) => string;
  cache?: boolean | {maxCount?: number, maxAge?: number};
  [key: string]: any;
}

interface IRequestOptionsWithResponse extends IRequestOptions {
  getResponse: true;
}

interface IRequestOptionsWithoutResponse extends IRequestOptions{
  getResponse: false;
}

export interface ApiResponse<T> {
  code: string,
  msg: string,
  totalRows?: number;
  totalPages?: number;
  result?: T,
  records?: T,
  pageSize?: number,
  currentPage?: number
  success: boolean,
  data: T{{{resultDataField}}} & T{{{resultDataField}}}['records'] & T['records'] & T,
  total: number
}

export interface AntdApiResponse<T> {
  success: boolean,
  data: T,
  total: number
}


interface IRequest{
   <T = any>(url: string, opts: IRequestOptionsWithResponse): Promise<AxiosResponse<ApiResponse<T>>>;
   <T = any>(url: string, opts: IRequestOptionsWithoutResponse): Promise<ApiResponse<T>>;
   <T = any>(url: string, opts: IRequestOptions): Promise<ApiResponse<T>>;
   <T = any>(url: string): Promise<ApiResponse<T>>; 
}

type RequestError = AxiosError | Error

interface IErrorHandler {
  (error: AxiosResponse<any, any> & {message: string}, opts: IRequestOptions): void;
}
type IRequestInterceptorAxios = (config: IRequestOptions) => IRequestOptions | Promise<IRequestOptions>;
type IRequestInterceptorUmiRequest = (url: string, config : IRequestOptions) => { url: string, options: RequestOptions } | Promise<{ url: string, options: RequestOptions }>;
type IRequestInterceptor = IRequestInterceptorAxios | IRequestInterceptorUmiRequest;
type IErrorInterceptor = (error: Error) => Promise<Error>;
type IResponseInterceptor = <T = any>(response : AxiosResponse<T>) => AxiosResponse<T> ;
type IRequestInterceptorTuple = [IRequestInterceptor , IErrorInterceptor] | [ IRequestInterceptor ] | IRequestInterceptor;
type IResponseInterceptorTuple = [IResponseInterceptor, IErrorInterceptor] | [IResponseInterceptor] | IResponseInterceptor;

 enum HttpStatusEnum {
  CONTINUE = 100,
  SWITCHING_PROTOCOLS = 101,
  PROCESSING = 102,
  SUCCESS = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NON_AUTHORITATIVE_INFORMATION = 203,
  NO_CONTENT = 204,
  RESET_CONTENT = 205,
  PARTIAL_CONTENT = 206,
  AMBIGUOUS = 300,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  SEE_OTHER = 303,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  PROXY_AUTHENTICATION_REQUIRED = 407,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  LENGTH_REQUIRED = 411,
  PRECONDITION_FAILED = 412,
  PAYLOAD_TOO_LARGE = 413,
  URI_TOO_LONG = 414,
  UNSUPPORTED_MEDIA_TYPE = 415,
  REQUESTED_RANGE_NOT_SATISFIABLE = 416,
  EXPECTATION_FAILED = 417,
  I_AM_A_TEAPOT = 418,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505,
}

 enum HttpMessageLocalEnum {
    BAD_GATEWAY = {
      [LanguageEnum.zhCn]: '网关错误',
      [LanguageEnum.enUs]: 'gateway error',
    },
    SERVICE_UNAVAILABLE = {
      [LanguageEnum.zhCn]: '服务不可用，服务器暂时过载或维护',
      [LanguageEnum.enUs]: 'Service unavailable, server temporarily overloaded or maintenance gateway error',
    },
    GATEWAY_TIMEOUT = {
      [LanguageEnum.zhCn]: '网关超时',
      [LanguageEnum.enUs]: 'gateway timeout',
    },
    NOT_FOUND = {
      [LanguageEnum.zhCn]: '路径错误',
      [LanguageEnum.enUs]: 'wrong path',
    },
    UNAUTHORIZED = {
      [LanguageEnum.zhCn]: '认证失败',
      [LanguageEnum.enUs]: 'Authentication failed',
    },
    BAD_REQUEST = {
      [LanguageEnum.zhCn]: '错误的请求',
      [LanguageEnum.enUs]: 'bad Request',
    },
    INTERNAL_SERVER_ERROR = {
      [LanguageEnum.zhCn]: '错误的请求',
      [LanguageEnum.enUs]: 'bad Request',
    },
    ERROR_HTTP = {
      [LanguageEnum.zhCn]: '服务器错误',
      [LanguageEnum.enUs]: 'Server Error',
    },
    FORBIDDEN = {
      [LanguageEnum.zhCn]: '无此权限',
      [LanguageEnum.enUs]: 'no permission',
    },
 }

 enum HttpMessageEnum {
  BAD_GATEWAY = HttpMessageLocalEnum["BAD_GATEWAY"][CURRENT_LANGUAGE_KEY],
  SERVICE_UNAVAILABLE =  HttpMessageLocalEnum["SERVICE_UNAVAILABLE"][CURRENT_LANGUAGE_KEY],
  GATEWAY_TIMEOUT = HttpMessageLocalEnum["GATEWAY_TIMEOUT"][CURRENT_LANGUAGE_KEY],
  NOT_FOUND =  HttpMessageLocalEnum["NOT_FOUND"][CURRENT_LANGUAGE_KEY],
  UNAUTHORIZED = HttpMessageLocalEnum["UNAUTHORIZED"][CURRENT_LANGUAGE_KEY],
  BAD_REQUEST = HttpMessageLocalEnum["BAD_REQUEST"][CURRENT_LANGUAGE_KEY],
  INTERNAL_SERVER_ERROR=HttpMessageLocalEnum["INTERNAL_SERVER_ERROR"][CURRENT_LANGUAGE_KEY],
  ERROR_HTTP =HttpMessageLocalEnum["ERROR_HTTP"][CURRENT_LANGUAGE_KEY],
  FORBIDDEN = HttpMessageLocalEnum["FORBIDDEN"][CURRENT_LANGUAGE_KEY],
}

export interface RequestConfig<T = any> extends AxiosRequestConfig {
  errorConfig?: {
    errorHandler?: IErrorHandler;
    customErrorShow?:  IErrorHandler;
  };
  requestInterceptors?: IRequestInterceptorTuple[];
  responseInterceptors?: IResponseInterceptorTuple[];
}

/**
 * 判断如果是 Promise, 则从 Promise 中取出并执行剩余操作, 此时返回 Promise
 * 如果不是 Promise, 则直接执行剩余操作, 此时直接返回结果
 */
const getPromiseValue = <T>(value: T | Promise<T>, callback: (val: T) => any): T | Promise<T> => {
  if (value instanceof Promise) {
    return value.then(callback);
  }
  return callback(value);
}

let requestInstance: AxiosInstance;
let config: RequestConfig;
const getConfig = (): RequestConfig => {
  if (config) return config;
  config = getPluginManager().applyPlugins({
    key: 'request',
    type: ApplyPluginsType.modify,
    initialValue: {},
  });
  return config;
};

const dealRequestData = (response: AxiosResponse<any, any>, opts: IRequestOptions) => {
  const { data, status, message } = response;
  const regex = /^0+$/;
  let httpMessage = null;
  if (Number(status) === 200) {
    if (data?.code && !regex.test(data?.code)) {
      if (!opts?.closeMessage) {
        config?.errorConfig?.customErrorShow ?
          config?.errorConfig?.customErrorShow(response, opts) :
          notification.error({
            message: data?.code,
            description: opts.setCustomMessage ? opts.setCustomMessage(response, opts): data?.msg
          });
      }
      if (config?.errorConfig?.errorHandler) {
        config?.errorConfig?.errorHandler(response, opts)
      }
      return Promise.reject(response);
    }
  } else {
    switch (status) {
      case HttpStatusEnum.BAD_GATEWAY:
        httpMessage = HttpMessageEnum.BAD_GATEWAY;
        break;
      case HttpStatusEnum.SERVICE_UNAVAILABLE:
        httpMessage = HttpMessageEnum.SERVICE_UNAVAILABLE;
        break;
      case HttpStatusEnum.GATEWAY_TIMEOUT:
        httpMessage = HttpMessageEnum.GATEWAY_TIMEOUT;
        break;
      case HttpStatusEnum.NOT_FOUND:
        httpMessage = HttpMessageEnum.NOT_FOUND;
        break;
      case HttpStatusEnum.UNAUTHORIZED:
        httpMessage = HttpMessageEnum.UNAUTHORIZED;
        break;
      case HttpStatusEnum.FORBIDDEN:
        httpMessage = HttpMessageEnum.FORBIDDEN;
        break;
      case HttpStatusEnum.BAD_REQUEST:
        httpMessage = HttpMessageEnum.BAD_REQUEST;
        break;
      default:
        httpMessage = HttpMessageEnum.ERROR_HTTP;
        break;
    }
    if (!opts?.closeMessage && status !== HttpStatusEnum.UNAUTHORIZED) {
      config?.errorConfig?.customErrorShow ?
        config?.errorConfig?.customErrorShow(response, opts) :
        notification.error({
          message: status ?  `${status}(${httpMessage})`: httpMessage,
          description: opts.setCustomMessage ? opts.setCustomMessage(response, opts) : (message || "服务器错误")
        })
    }
    if (config?.errorConfig?.errorHandler) {
      config?.errorConfig?.errorHandler(response, opts)
    }
    return Promise.reject(response);
  }
  return response;
};

const getRequestInstance = (opts): AxiosInstance => {
  if (requestInstance) return requestInstance;
  const config = getConfig();
  requestInstance = axios.create({
    ...config,
  });

  const configCache = opts.cache;
  const finalCache = {
   enabledByDefault: configCache === true || !!configCache?.maxAge || !!configCache?.maxCount,
   maxCount: configCache?.maxCount,
   maxAge: configCache?.maxAge
  };

  
  const cache = cacheAdapterEnhancer(finalCache);
  const _request = requestInstance.request;
  requestInstance.request = (config) => cache(_request, config);

  config?.requestInterceptors?.forEach((interceptor) => {
    if(interceptor instanceof Array){
      requestInstance.interceptors.request.use((config) => {
        const { url } = config;
        if(interceptor[0].length === 2){
          const res = interceptor[0](url, config);
          return getPromiseValue(res, (val) => {
            const { url: newUrl, options = {} } = val
            return { ...options, url: newUrl }
          });
        }
        return interceptor[0](config);
      }, interceptor[1]);
    } else {
      requestInstance.interceptors.request.use((config) => {
        const { url } = config;
        if(interceptor.length === 2){
          const res = interceptor(url, config);
          return getPromiseValue(res, (val) => {
            const { url: newUrl, options = {} } = val
            return { ...options, url: newUrl }
          });
        }
        return interceptor(config);
      })
    }
  });

  config?.responseInterceptors?.forEach((interceptor) => {
    interceptor instanceof Array ?
      requestInstance.interceptors.response.use(interceptor[0], interceptor[1]):
       requestInstance.interceptors.response.use(interceptor);
  });

  requestInstance.interceptors.response.use((response) => {
    return dealRequestData(response, opts);
  })
  return requestInstance;
};

const changeRequestData = (opts: IRequestOptions) => {
  const optsData = opts?.data  || {};
  const optsParams =  opts?.params  || {};
  const contentType = opts?.headers?  opts?.headers['Content-Type']: null;
  let finalOpts = {...opts};
  if (optsData && optsData?.current) {
    optsData.currentPage = optsData.current;
    delete optsData.current;
    finalOpts.data = {...optsData};
  }
  if(optsParams && optsParams?.current){
    optsParams.currentPage = optsParams.current;
    delete optsParams.current;
    finalOpts.params = {...optsParams};
  }
  if( contentType && contentType.includes('multipart/form-data') ){
     let formData = new FormData();
     let userData = opts?.params || opts.data || {};
     Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
     })
    finalOpts.data = formData;
    if(finalOpts.params){
      delete finalOpts.params;
    }
  }
  finalOpts.headers = {
  ...finalOpts.headers,
  "Accept-Language": CURRENT_LANGUAGE_KEY
  }
  return finalOpts;
};

const changeResponseData = (response: AxiosResponse<any, any>, getResponse: boolean) => {
  const currentResponseData = response.data;
  let finalResponse = currentResponseData;
  if (currentResponseData?.code) {
    const { code, result } = currentResponseData;
    const regex = /^0+$/;
    if (result) {
      finalResponse = {
        ...currentResponseData,
        success: regex.test(code),
        data: Array.isArray(result) ? result : result?.records,
        total: Array.isArray(result) ? result.length : result?.totalRows
      }
    }
    response.data = { ...finalResponse };
  }
  return getResponse ? response : finalResponse;
};

const request: IRequest = (url: string, opts: IRequestOptions = { method: 'GET' }) => {
  const requestInstance = getRequestInstance(opts);
  const config = getConfig();
  const finalOpts = changeRequestData(opts);
  const { getResponse = false, requestInterceptors, responseInterceptors } = finalOpts;
  const requestInterceptorsToEject = requestInterceptors?.map((interceptor) => {
    if(interceptor instanceof Array){
      return requestInstance.interceptors.request.use((config) => {
        const { url } = config;
        if(interceptor[0].length === 2){
          const res = interceptor[0](url, config);
          return getPromiseValue(res, (val) => {
            const { url: newUrl, options = {} } = val
            return { ...options, url: newUrl }
          });
        }
        return interceptor[0](config);
      }, interceptor[1]);
    } else {
      return requestInstance.interceptors.request.use((config) => {
        const { url } = config;
        if(interceptor.length === 2){
          const res = interceptor(url, config);
          return getPromiseValue(res, (val) => {
            const { url: newUrl, options = {} } = val
            return { ...options, url: newUrl }
          });
        }
        return interceptor(config);
      })
    }
    });
  const responseInterceptorsToEject = responseInterceptors?.map((interceptor) => {
    return interceptor instanceof Array ?
      requestInstance.interceptors.response.use(interceptor[0], interceptor[1]):
       requestInstance.interceptors.response.use(interceptor);
    });
  return new Promise((resolve, reject)=>{
    requestInstance
      .request({...finalOpts, url})
      .then((res)=>{
        requestInterceptorsToEject?.forEach((interceptor) => {
          requestInstance.interceptors.request.eject(interceptor);
        });
        responseInterceptorsToEject?.forEach((interceptor) => {
          requestInstance.interceptors.response.eject(interceptor);
        });
        resolve(changeResponseData(res,getResponse ))
      })
      .catch((error)=>{
        requestInterceptorsToEject?.forEach((interceptor) => {
          requestInstance.interceptors.request.eject(interceptor);
        });
        responseInterceptorsToEject?.forEach((interceptor) => {
          requestInstance.interceptors.response.eject(interceptor);
        });
        const {response, message} = error;
        if(response){
          dealRequestData({
            ...response,
            message
          }, opts);
        }
        reject(error);
      })
  })
}

// interface PageParams {
//   pageSize?: number;
//   current?: number;
//   keyword?: string;
// }

// type WidthPageParams<T> = T & PageParams;

// type TableRequest<T, U> = ProTableProps<T, U>['request']


type ApiSort = {
  field?: string;
  direction?: string;
  asc?: boolean;
}

type SortOrder = Record<string, "descend" | "ascend" | null>

function sortFilterProTable<P, D>(
  fn: (
    params: P & {
      sort?: ApiSort[];
    }
  ) => Promise<ApiResponse<D>>
) {
  return (
    params: P & {
      pageSize?: number;
      current?: number;
      keyword?: string;
    },
    sort: SortOrder,
    filter: Record<string, (string | number)[] | null>
  ) => {
    let finalSort: ApiSort = {};
    let finalParams:  P & {
      pageSize?: number;
      current?: number;
      keyword?: string;
      sort?: ApiSort[]
    }  = {...params};

    if(sort){
      Object.keys(sort).forEach((key) => {
        if (sort[key]) {
          finalSort.field = key;
          finalSort.asc = sort[key] === "ascend" ? true : false;
        }
      });
    };

    if(filter){
      Object.keys(filter).forEach((key) => {
        if (filter[key]) {
          finalParams[key] = filter[key];
        }
      });
    }

    if(finalSort.field){
      finalParams.sort = [finalSort];
    }
    return fn(finalParams);
  };
}

export {
  useRequest,
  request,
  getRequestInstance,
  sortFilterProTable,
  HttpStatusEnum,
  HttpMessageEnum
};
export type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  RequestError,
  IResponseInterceptor as ResponseInterceptor,
  IRequestOptions as RequestOptions,
  IRequest as Request,
};

