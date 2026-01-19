import { DuplicatePlugin, LoadingPlugin, request as creekRequest } from '@creekjs/request';
import { Loading } from '@creekjs/web-components';
import { BusinessResponsePlugin } from './BusinessResponsePlugin';

export const initRequest = () => {
  creekRequest.createInstance({
    openLoading: false,
  });

  creekRequest.pluginManager
    .use(
      new LoadingPlugin({
        showLoading(config) {
          if (config.openLoading) {
            Loading.open();
          }
        },
        hideLoading(config) {
          if (config.openLoading) {
            Loading.close();
          }
        },
      }),
    )
    .use(new DuplicatePlugin())
    .use(new BusinessResponsePlugin());
};
