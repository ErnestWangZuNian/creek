import { AxiosPlugin, AxiosPluginConfigType, AxiosPluginErrorType, AxiosPluginResponseType } from "./AxiosPlugin";


export type DuplicatePluginConfigType = {
    closeDuplicate?: boolean
}

// 防重复提交插件
export class DuplicatePlugin extends AxiosPlugin {

    private pending: Map<string, boolean>;

    constructor() {
        super();
        this.pending = new Map();
    }

    beforeRequest(config: AxiosPluginConfigType<DuplicatePluginConfigType>) {
        if (!config.closeDuplicate) {
            const key = this.getRequestKey(config);
            console.log(this.pending, 'this.pending1111');
            // 检查是否有相同且未取消的请求
            if (this.pending.has(key)) {
                return Promise.reject({
                    config
                });
            }
            this.pending.set(key, true);
            return {
                ...config,

            };
        }
        return config;
    }

    afterRequest(response: AxiosPluginResponseType<DuplicatePluginConfigType>) {
        console.log(response, 'response111');
        if (!response.config.closeDuplicate) {
            const key = this.getRequestKey(response.config);
            this.pending.delete(key);
        }
        return response;
    }

    onError(error: AxiosPluginErrorType<DuplicatePluginConfigType>) {
        console.log(error, 'error11111');
        if (error.config && !error.config.closeDuplicate) {
            const key = this.getRequestKey(error.config);
            this.pending.delete(key);
        }
        return Promise.reject(error);
    }

    getRequestKey(config: AxiosPluginConfigType<DuplicatePluginConfigType>) {
        return `${config.method}:${config.url}${JSON.stringify(config.params || {})}${JSON.stringify(config.data || {})}`;
    }
}   