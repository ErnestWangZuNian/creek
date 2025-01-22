import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';


export type AxiosPluginConfigType<T = any, D = any> = InternalAxiosRequestConfig<D> & T;
export type AxiosPluginResponseType<T = any, D = any> = Omit<AxiosResponse, 'config'> & { config: AxiosPluginConfigType<T, D> };
export type AxiosPluginErrorType<T = any, D = any> = Omit<AxiosError, 'config'> & { config: AxiosPluginConfigType<T, D> };

export class AxiosPlugin {

    public axios: AxiosInstance | null;

    constructor() {
        this.axios = null;
    }

    // 插件初始化
    init(axiosInstance: AxiosInstance) {
        this.axios = axiosInstance;
    }

    // 请求前钩子
    beforeRequest(config: AxiosPluginConfigType) {
        return config;
    }

    // 请求后钩子
    afterRequest(response: AxiosPluginResponseType) {
        return response;
    }

    // 错误处理钩子
    onError(error: AxiosPluginErrorType) {
        return Promise.reject(error);
    }
}