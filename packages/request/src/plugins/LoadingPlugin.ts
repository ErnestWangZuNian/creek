import { AxiosPlugin, AxiosPluginConfigType, AxiosPluginErrorType, AxiosPluginResponseType } from "./AxiosPlugin";


export type LoadingPluginConfigType = {
    openLoading?: boolean
}

export type LoadingPluginOptions = {
    showLoading: (config: AxiosPluginConfigType<LoadingPluginConfigType>) => void;
    hideLoading: (config: AxiosPluginConfigType<LoadingPluginConfigType>) => void;
}

// 防重复提交插件
export class LoadingPlugin extends AxiosPlugin {

    private count: number;
    private showLoading: LoadingPluginOptions["showLoading"]
    private hideLoading: LoadingPluginOptions['hideLoading']

    constructor(options: LoadingPluginOptions) {
        super();
        this.count = 0;
        this.showLoading = options.showLoading;
        this.hideLoading = options.hideLoading;
    }

    beforeRequest(config: AxiosPluginConfigType<LoadingPluginConfigType>) {
        this.count++;
        this.showLoading(config);
        return config;
    }

    afterRequest(response: AxiosPluginResponseType<LoadingPluginConfigType>) {
        this.count--;
        if (this.count === 0) {
            this.hideLoading(response.config);
        }
        return response;
    }


    onError(error: AxiosPluginErrorType<LoadingPluginConfigType>) {
        this.count--;
        if (this.count === 0) {
            this.hideLoading(error.config);
        }
        return Promise.reject(error);
    }

}   