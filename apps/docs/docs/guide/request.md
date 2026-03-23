# 网络请求 (@creekjs/request)

在复杂的企业级应用中，网络请求往往不只是简单的发起 AJAX 调用，还需要处理防重复提交、全局 Loading 状态、统一的错误拦截、多实例隔离等各种业务场景。

`@creekjs/request` 是一个基于 `axios` 深度封装的增强型 HTTP 请求库，它通过优雅的**插件系统（Plugin System）**，提供了一套高度可扩展的网络层解决方案。

## 为什么需要 @creekjs/request？

直接使用原生的 `axios` 或简单的拦截器封装通常会面临以下痛点：
1. **防重逻辑混乱**：为了防止用户连点按钮导致重复提交，经常需要在业务组件中写大量的 `loading` 或 `disabled` 状态，或者在拦截器里写复杂的取消请求逻辑。
2. **多实例管理困难**：当应用需要对接多个不同域名的服务（比如主业务 API 和上传服务 API），它们的鉴权方式和错误处理逻辑可能完全不同，简单的全局拦截器难以应对。
3. **拦截器臃肿**：所有的处理逻辑（加 Token、处理 Loading、处理错误、数据转换）都堆砌在一个拦截器中，难以维护和复用。

`@creekjs/request` 通过引入面向对象的插件机制，彻底解决了这些问题。

## 核心设计：插件化架构

`@creekjs/request` 并不将所有的能力硬编码在请求实例中，而是提供了一个基座和插件管理器 (`AxiosPluginManager`)。

每一个独立的功能（如防重、Loading）都被抽象为一个插件，实现了 `AxiosPlugin` 接口：
- `beforeRequest`: 请求发送前执行（对应请求拦截器）
- `afterRequest`: 请求成功后执行（对应响应拦截器成功分支）
- `onError`: 请求失败时执行（对应响应拦截器失败分支）

这种设计让各个功能的职责高度单一，代码解耦。

---

## 核心能力与内置插件

### 1. 🛡️ 智能防重复请求 (`DuplicatePlugin`)

防重是表单提交最常见的需求。`DuplicatePlugin` 提供了一套非常完善的静默防重机制。

**特性：**
- **自动唯一标识**：根据请求的 Method、URL、Params 和 Data 自动生成唯一 Key。
- **飞行锁 (In-Flight)**：只要同一个请求还在 Pending 状态，后续一模一样的请求会被直接拦截并取消。
- **静默处理**：被拦截的重复请求会返回一个永远 `pending` 的 Promise，这样既打断了执行链，又不会触发业务层的 `catch` 报错（避免引发全局的 Toast 错误提示）。
- **冷却期 (Cooldown)**：支持配置 `cooldownInterval`，即使请求成功返回了，在指定的毫秒数内依然不允许发起同样的请求。
- **路由切换自动清理**：监听 `hashchange` 和 `popstate`，在页面切换时自动清理所有的锁，防止上一个页面的慢请求卡死新页面的同名请求。

**使用示例：**
```typescript
import { request, plugins } from '@creekjs/request';

request.pluginManager.use(new plugins.DuplicatePlugin({
  throwDuplicateError: false, // 默认不抛出错误，静默处理
  cooldownInterval: 500,      // 请求完成后 500ms 内不允许重发
}));
```

### 2. ⏳ 自动化 Loading 管理 (`LoadingPlugin`)

如果你需要一个全局的顶条 Loading 或者遮罩 Loading，`LoadingPlugin` 可以帮你自动管理引用计数。

**特性：**
- 内部维护请求计数器（Count）。
- 并发发起多个请求时，只会触发一次 `showLoading`。
- 所有请求都完成或失败后，才会触发 `hideLoading`。

**使用示例：**
```typescript
import { request, plugins } from '@creekjs/request';
import { message } from 'antd'; // 或其他 UI 库

let loadingMsg: any;

request.pluginManager.use(new plugins.LoadingPlugin({
  showLoading: () => {
    loadingMsg = message.loading('加载中...', 0);
  },
  hideLoading: () => {
    if (loadingMsg) {
      loadingMsg(); // 关闭 message
    }
  }
}));
```

### 3. 📦 友好的泛型解包与响应推断

在中后台表格开发中，经常需要对接各种分页格式（如 `records`, `result`, `list` 等）。
`@creekjs/request` 内部提供了 `NormalizeResponse<T>` 类型推断：

它能智能地尝试提取 `data.records` 或 `data.list` 提升为顶层的 `data` 属性，以完美适配如 `@creekjs/web-components` 中 `SearchTable` 等高级组件对标准数据结构的要求。

### 4. 🛠️ 多实例隔离

通过 `request.createInstance()`，你可以轻松创建相互独立的请求实例，并为它们挂载完全不同的插件：

```typescript
import { request, plugins } from '@creekjs/request';

// 1. 核心业务 API 实例（带防重）
const apiRequest = request.createInstance({ baseURL: '/api/v1' });
apiRequest.pluginManager.use(new plugins.DuplicatePlugin());

// 2. 日志上报 API 实例（不需要防重，不需要 Loading）
const logRequest = request.createInstance({ baseURL: '/api/log' });
// 不挂载任何额外插件
```

---

## 最佳实践：PC Demo 中的真实配置

在 CreekJS 的标准模板中，我们通过自定义 `BusinessResponsePlugin` 实现了与业务后端接口协议的无缝对接，以及与 `CreekTable` (底层为 `ProTable`) 分页参数的自动转换。

以下是 `apps/pc-demo` 中的真实配置代码：

### 1. 自定义业务响应插件

创建一个处理后端标准结构（如 `{ code: 200, data: {...}, msg: 'success' }`）的插件：

```typescript
// src/request/BusinessResponsePlugin.ts
import { message } from 'antd';
import { AxiosPlugin, AxiosPluginConfigType, AxiosPluginErrorType, AxiosPluginResponseType } from '@creekjs/request';
import { t } from '@/utils/i18n';

export class BusinessResponsePlugin extends AxiosPlugin {
  // 1. 处理请求前的参数映射 (ProTable 兼容)
  beforeRequest(config: AxiosPluginConfigType) {
    if (config.params) {
      const { current, pageSize, ...rest } = config.params;
      // ProTable 默认传 current/pageSize，这里自动转换为后端需要的 page/size
      if (current !== undefined || pageSize !== undefined) {
        config.params = { ...rest, page: current, size: pageSize };
      }
    }
    return config;
  }

  // 2. 处理请求成功后的响应
  afterRequest<T>(response: AxiosPluginResponseType<any>) {
    const { data: resData } = response;

    if (resData && typeof resData === 'object' && 'code' in resData) {
      const { code, msg, message: msgAlt } = resData;

      // 校验业务状态码
      const successCodes = [200, '200', '0000', '000000'];
      if (!successCodes.includes(code)) {
        message.error(msg || msgAlt || '请求失败');
        return Promise.reject(response);
      }
      
      const finalData = resData.data;

      // 自动识别分页结构并转换 (ProTable 兼容)
      // 如果 data 中包含 records 数组，将其提升到顶层，并注入 success 和 total
      if (finalData && typeof finalData === 'object' && Array.isArray(finalData.records)) {
        return {
          ...finalData,
          data: finalData.records, // ProTable 需要 data 为数组
          success: true,           // ProTable 必须
          total: finalData.total || 0,
        };
      }

      // 普通接口解包
      return { ...resData, success: true };
    }
    return response;
  }

  // 3. 处理 HTTP 网络错误
  onError(error: AxiosPluginErrorType) {
    message.error(error.message || '网络请求错误');
    return Promise.reject(error);
  }
}
```

### 2. 全局注册插件

在项目的请求初始化入口，组装需要的插件：

```typescript
// src/request/index.ts
import { DuplicatePlugin, LoadingPlugin, request as creekRequest } from '@creekjs/request';
import { Loading } from '@creekjs/web-components';
import { BusinessResponsePlugin } from './BusinessResponsePlugin';

export const initRequest = () => {
  // 默认关闭全局 Loading，可由单个接口按需开启
  creekRequest.createInstance({ openLoading: false });

  creekRequest.pluginManager
    .use(
      new LoadingPlugin({
        showLoading(config) {
          if (config.openLoading) Loading.open();
        },
        hideLoading(config) {
          if (config.openLoading) Loading.close();
        },
      }),
    )
    .use(new DuplicatePlugin())         // 挂载防重复请求插件
    .use(new BusinessResponsePlugin()); // 挂载业务响应处理插件
};
```

这样，业务开发人员在使用 `@creekjs/request` 或者通过 OpenAPI 生成的 service 代码时，完全不需要关心分页参数转换、防重复提交以及错误提示的细节。