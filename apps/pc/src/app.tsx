// 运行时配置
import { DuplicatePlugin, LoadingPlugin, request } from '@creek/request';
import { Loading } from '@creek/web-components';
import { RunTimeLayoutConfig } from '@umijs/max';

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string }> {
  return { name: '@umijs/max' };
}

export const layout: RunTimeLayoutConfig = (props) => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
    iconfontCNs: ['//at.alicdn.com/t/c/font_4756000_mbo4n1jtw7m.js'],
  };
};

request
  .createInstance({})
  .pluginManager
  .use(
    new LoadingPlugin({
      showLoading() {
        Loading.open({
          tip: '正在加载数据，请您耐心等待'
        })
      },
      hideLoading() {
        Loading.close();
      },
    }),
  )
 .use(new DuplicatePlugin())
