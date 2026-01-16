import { AxiosPlugin, AxiosPluginConfigType, AxiosPluginErrorType, AxiosPluginResponseType } from "./AxiosPlugin";


export type DuplicatePluginConfigType = {
    closeDuplicate?: boolean;
    // 允许重复请求的时间间隔，默认 300ms
    duplicateInterval?: number;
    // 用于内部存储生成的请求唯一标识
    __duplicateKey__?: string;
    // 内部标记：是否为重复请求
    __isDuplicate__?: boolean;
}


// 防重复提交插件
export class DuplicatePlugin extends AxiosPlugin {

    private pending: Map<string, number>; // 只要 key 存在，就表示需要拦截（无论是 pending 中还是冷却中）
    private options: DuplicatePluginConfigType;

    constructor(options: DuplicatePluginConfigType = {}) {
        super();
        this.pending = new Map();
        this.options = options;
    }

    beforeRequest(config: AxiosPluginConfigType<DuplicatePluginConfigType>) {
        const closeDuplicate = config.closeDuplicate ?? this.options.closeDuplicate ?? false;
        
        if (!closeDuplicate) {
            const key = this.getRequestKey(config);

            // 规则1 & 规则2：只要 Key 存在，说明要么正在请求，要么还在冷却期，一律拦截
            if (this.pending.has(key)) {
               console.warn("Duplicate request canceled", key);
                // 标记此 config 为重复请求，以便 onError 识别
                config.__isDuplicate__ = true;
                
                return Promise.reject({
                    config
                });
            }
            
            // 标记为占用
            this.pending.set(key, Date.now()); // 这里值不重要，只要 key 存在即可，但为了类型匹配，使用 Date.now()
            
            // 将 key 存储在 config 中，确保 afterRequest/onError 能拿到完全一致的 key
            config.__duplicateKey__ = key;
            return config;
        }
        return config;
    }

    afterRequest(response: AxiosPluginResponseType<DuplicatePluginConfigType>) {
        const closeDuplicate = response.config.closeDuplicate ?? this.options.closeDuplicate ?? false;
        
        if (!closeDuplicate) {
            const key = response.config.__duplicateKey__ || this.getRequestKey(response.config);
            const interval = response.config.duplicateInterval ?? this.options.duplicateInterval ?? 300; // 默认 300ms

            // 关键逻辑：请求完成后，不立即删除 Key，而是延迟删除
            // 这样在 interval 时间内，新请求进来依然会发现 Key 存在而被拦截
            if (interval > 0) {
                setTimeout(() => {
                    this.pending.delete(key);
                }, interval);
            } else {
                this.pending.delete(key);
            }
        }
        return response;
    }

    onError(error: AxiosPluginErrorType<DuplicatePluginConfigType>) {
        // 如果是重复请求导致的错误，不要清理锁！
        if (error.config && error.config.__isDuplicate__) {
            return Promise.reject(error);
        }
        
        if (error.message === "Duplicate request canceled") {
            return Promise.reject(error);
        }

        const config = error.config || {};
        const closeDuplicate = config.closeDuplicate ?? this.options.duplicateInterval ?? false;

        if (error.config && !closeDuplicate) {
            const key = error.config.__duplicateKey__ || this.getRequestKey(error.config);

            this.pending.delete(key);
        }
        return Promise.reject(error);
    }

    getRequestKey(config: AxiosPluginConfigType<DuplicatePluginConfigType>) {
        const { method, url, params, data } = config;
        // 使用更稳定的序列化方式，避免 null/undefined 问题
        return [
            method,
            url,
            JSON.stringify(params),
            JSON.stringify(data)
        ].join('&');
    }
}
