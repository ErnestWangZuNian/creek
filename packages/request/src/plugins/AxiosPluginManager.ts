import { AxiosInstance } from "axios";
import { AxiosPlugin } from "./AxiosPlugin";

// 插件管理器
export class AxiosPluginManager {
    private axios: AxiosInstance;
    private plugins: AxiosPlugin[];

    constructor(axios: AxiosInstance) {
        this.axios = axios;
        this.plugins = [];
        this.setupInterceptors();
    }

    use(plugin: AxiosPlugin) {
        plugin.init(this.axios);
        this.plugins.push(plugin);
        return this;
    }

    setupInterceptors() {
        // 请求拦截器
        this.axios.interceptors.request.use(
            async (config) => {
                for (const plugin of this.plugins) {
                    config = await plugin.beforeRequest(config);
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // 响应拦截器
        this.axios.interceptors.response.use(
            async (response) => {
                for (const plugin of this.plugins) {
                    response = await plugin.afterRequest(response);
                }
                return response;
            },
            async (error) => {
                for (const plugin of this.plugins) {
                    await plugin.onError(error);
                }
                return Promise.reject(error);
            }
        );
    }
}