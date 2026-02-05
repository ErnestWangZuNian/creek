import { Toast } from '@antmjs/vantui';
import { useDidHide, useDidShow } from '@tarojs/taro';
import { useEffect } from 'react';

import { DuplicatePlugin, LoadingPlugin, request } from '@creekjs/request';
import { taroAdapter } from "@creekjs/taro-adapter";

// 全局样式
import './app.less';

request
  .createInstance({
    baseURL: 'https://petstore.swagger.io',
    adapter: taroAdapter
  }).pluginManager.use(new DuplicatePlugin()).use(new LoadingPlugin({
    showLoading() {
      Toast.loading({ message: '正在加载' })
    },
    hideLoading() {
      Toast.clear();
    }
  }));


function App(props) {
  // 可以使用所有的 React Hooks
  useEffect(() => { })

  // 对应 onShow
  useDidShow(() => {

  })

  // 对应 onHide
  useDidHide(() => { })

  return props.children
}

export default App
