import { AxiosPlugin, AxiosPluginConfigType, AxiosPluginErrorType, AxiosPluginResponseType } from "./AxiosPlugin";


export type DuplicatePluginConfigType = {
    noDuplicate?: boolean
}

// 防重复提交插件
export class DuplicatePlugin extends AxiosPlugin {

    private pending: Map<string, boolean>;

    private controller = new AbortController();

    constructor() {
        super();
        this.pending = new Map();
    }

    beforeRequest(config: AxiosPluginConfigType<DuplicatePluginConfigType>) {
        if (config.noDuplicate) {
            const key = this.getRequestKey(config);
            if (this.pending.has(key)) {
                return {
                    ...config,
                    signal: this.controller.signal
                };
            }
            this.pending.set(key, true);
        }
        return config;
    }

    afterRequest(response: AxiosPluginResponseType<DuplicatePluginConfigType>) {
        if (response.config.noDuplicate) {
            const key = this.getRequestKey(response.config);
            this.pending.delete(key);
        }
        return response;
    }

    onError(error: AxiosPluginErrorType<DuplicatePluginConfigType>) {
        if (error.config && error.config.noDuplicate) {
            const key = this.getRequestKey(error.config);
            this.pending.delete(key);
        }
        return Promise.reject(error);
    }

    getRequestKey(config: AxiosPluginConfigType<DuplicatePluginConfigType>) {
        return `${config.method}:${config.url}${JSON.stringify(config.params || {})}${JSON.stringify(config.data || {})}`;
    }
}   