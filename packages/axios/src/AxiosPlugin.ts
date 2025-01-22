import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

abstract class AxiosPlugins {
    protected axios: AxiosInstance | null;

    constructor() {
        this.axios = null;
    }

    init(axiosInstance: AxiosInstance) {
        this.axios = axiosInstance;
    }

    abstract beforeRequest(config: AxiosRequestConfig): AxiosRequestConfig;

    abstract afterRequest(response: AxiosResponse): AxiosResponse;

    abstract onError(error: AxiosError): Promise<never>;
} 