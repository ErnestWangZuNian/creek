import { AxiosPlugin, AxiosPluginConfigType, AxiosPluginErrorType, AxiosPluginResponseType } from "./AxiosPlugin";


export type LoadingPluginConfigType = {
    closeLoading?: boolean
}

export type LoadingPluginOptions = {
    showLoading?: () => void;
    hideLoading?: () => void;
}

// 防重复提交插件
export class LoadingPlugin extends AxiosPlugin {

    private count: number;
    private showLoading: () => void
    private hideLoading: () => void

    constructor(options: LoadingPluginOptions = {}) {
        super();
        this.count = 0;
        this.showLoading = options.showLoading || (() => { });
        this.hideLoading = options.hideLoading || (() => { });
    }

    beforeRequest(config: AxiosPluginConfigType<LoadingPluginConfigType>) {
        if (!config.closeLoading) {

            this.count++;
            this.showLoading();
        }
        return config;
    }

    afterRequest(response: AxiosPluginResponseType<LoadingPluginConfigType>) {
        if (!response.config.closeLoading) {
            this.count--;
            if (this.count === 0) {
                this.hideLoading();
            }
        }
        return response;
    }


    onError(error: AxiosPluginErrorType<LoadingPluginConfigType>) {
        if (error.config && !error.config.closeLoading) {
            this.count--;
            if (this.count === 0) {
                this.hideLoading();
            }
        }
        return Promise.reject(error);
    }




}   