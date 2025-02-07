

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { AxiosPluginConfigType } from './plugins/AxiosPlugin';
import { AxiosPluginManager } from './plugins/AxiosPluginManager';

let requestInstance = axios.create();


interface RequestFunction {
    <T = any>(url: string, config: AxiosPluginConfigType): Promise<T>;
    instance: AxiosInstance;
    pluginManager: AxiosPluginManager;
    createInstance: (config?: AxiosRequestConfig) => RequestFunction;
}


export const request: RequestFunction = (url: string, config: AxiosPluginConfigType) => {
    return requestInstance({
        url,
        ...config
    })
};

request.instance = requestInstance;
request.pluginManager = new AxiosPluginManager(requestInstance);

request.createInstance = (config?: AxiosRequestConfig) => {
    requestInstance = axios.create(config);
    request.instance = requestInstance;
    request.pluginManager = new AxiosPluginManager(requestInstance);
    return request;
};

