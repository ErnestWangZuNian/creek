# @creekjs/umi-plugins

Umi 框架的插件集合，提供布局管理和 OpenAPI 集成功能。

## 特性

- 🎨 Creek Layout - 智能布局插件
- 📡 OpenAPI 集成 - 自动生成 API 服务
- 🔧 开箱即用的配置
- 🛠️ TypeScript 支持

## 安装

```bash
npm install @creekjs/umi-plugins --save-dev
# 或
yarn add @creekjs/umi-plugins -D
```

## 插件列表

### 1. Creek Layout 插件

智能布局插件，自动处理路由图标和布局配置。

#### 配置

在 `.umirc.ts` 或 `config/config.ts` 中配置：

```typescript
export default {
  plugins: [
    '@creekjs/umi-plugins/creek-layout'
  ],
  // 插件会自动处理布局相关配置
};
```

#### 功能特性

- **自动图标检测**: 自动检测和配置 Ant Design 图标
- **路由增强**: 为路由自动添加图标和布局信息
- **类型安全**: 提供完整的 TypeScript 类型支持

#### 路由配置示例

```typescript
// config/routes.ts
export default [
  {
    path: '/',
    component: '@/layouts/index',
    routes: [
      {
        path: '/dashboard',
        name: '仪表盘',
        icon: 'DashboardOutlined', // 插件会自动验证图标
        component: './Dashboard'
      },
      {
        path: '/users',
        name: '用户管理',
        icon: 'UserOutlined',
        component: './Users'
      }
    ]
  }
];
```

### 2. OpenAPI 插件

集成 OpenAPI 服务生成功能到 Umi 构建流程。

#### 配置

```typescript
// .umirc.ts
export default {
  plugins: [
    '@creekjs/umi-plugins/open-api'
  ],
  openApi: {
    requestLibPath: '@/utils/request',
    schemaPath: 'https://api.example.com/swagger.json',
    serversPath: './src/services',
    projectName: 'myProject'
  }
};
```

#### 配置选项

```typescript
interface OpenApiConfig {
  requestLibPath?: string;        // 请求库路径
  requestOptionsType?: string;    // 请求选项类型
  requestImportStatement?: string; // 请求导入语句
  apiPrefix?: string | ((params: ApiPrefixParams) => string); // API 前缀
  serversPath?: string;           // 服务输出路径
  schemaPath?: string;            // OpenAPI 规范文件路径
  projectName?: string;           // 项目名称
  namespace?: string;             // 命名空间
  enumStyle?: 'string-literal' | 'enum'; // 枚举样式
  nullable?: boolean;             // 是否允许 null
  templatesFolder?: string;       // 模板文件夹
  dataFields?: string[];          // 数据字段
  isCamelCase?: boolean;          // 是否使用驼峰命名
}
```

#### 多配置支持

```typescript
// 支持多个 API 源
export default {
  openApi: [
    {
      requestLibPath: '@/utils/request',
      schemaPath: 'https://api1.example.com/swagger.json',
      serversPath: './src/services/api1',
      namespace: 'api1'
    },
    {
      requestLibPath: '@/utils/request',
      schemaPath: 'https://api2.example.com/swagger.json',
      serversPath: './src/services/api2',
      namespace: 'api2'
    }
  ]
};
```

#### 命令行使用

```bash
# 生成 API 服务
umi openApi

# 在构建时自动生成
umi build
```

## 工具函数

### withTmpPath

生成临时文件路径的工具函数。

```typescript
import { withTmpPath } from '@creekjs/umi-plugins/utils';

// 在插件中使用
export default (api: IApi) => {
  const tmpPath = withTmpPath({
    api,
    path: 'my-plugin/config.ts'
  });
  
  // 生成临时文件
  api.writeTmpFile({
    path: tmpPath,
    content: 'export default {};'
  });
};
```

## 完整配置示例

### 基础项目配置

```typescript
// .umirc.ts
import { defineConfig } from '@umijs/max';

export default defineConfig({
  // 插件配置
  plugins: [
    '@creekjs/umi-plugins/creek-layout',
    '@creekjs/umi-plugins/open-api'
  ],
  
  // OpenAPI 配置
  openApi: {
    requestLibPath: '@/utils/request',
    schemaPath: process.env.API_SCHEMA_URL || 'http://localhost:3001/api-docs',
    serversPath: './src/services',
    projectName: 'myApp',
    isCamelCase: true,
    enumStyle: 'string-literal'
  },
  
  // 其他 Umi 配置
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'Creek App'
  }
});
```

### 请求库配置

```typescript
// src/utils/request.ts
import { request } from '@creekjs/request';
import { message } from 'antd';

// 请求拦截器
request.instance.interceptors.request.use(
  (config) => {
    // 添加认证头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 统一错误处理
    const { response } = error;
    if (response?.status === 401) {
      message.error('登录已过期，请重新登录');
      // 跳转到登录页
      window.location.href = '/login';
    } else {
      message.error(error.message || '请求失败');
    }
    return Promise.reject(error);
  }
);

export default request;
```

### 路由配置

```typescript
// config/routes.ts
export default [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    name: '仪表盘',
    icon: 'DashboardOutlined',
    path: '/dashboard',
    component: './Dashboard'
  },
  {
    name: '用户管理',
    icon: 'UserOutlined',
    path: '/users',
    routes: [
      {
        name: '用户列表',
        path: '/users/list',
        component: './Users/List'
      },
      {
        name: '用户详情',
        path: '/users/:id',
        component: './Users/Detail',
        hideInMenu: true
      }
    ]
  },
  {
    name: '系统设置',
    icon: 'SettingOutlined',
    path: '/settings',
    component: './Settings'
  }
];
```

## 开发自定义插件

### 插件结构

```typescript
// src/my-plugin/index.ts
import { IApi } from '@umijs/max';
import { withTmpPath } from '@creekjs/umi-plugins/utils';

export default (api: IApi) => {
  // 插件描述
  api.describe({
    key: 'myPlugin',
    config: {
      schema: ({ zod }) => {
        return zod.object({
          enabled: zod.boolean().optional()
        });
      }
    },
    enableBy: api.EnableBy.config
  });
  
  // 修改配置
  api.modifyConfig((memo) => {
    // 修改配置逻辑
    return memo;
  });
  
  // 生成临时文件
  api.onGenerateFiles(() => {
    const tmpPath = withTmpPath({
      api,
      path: 'my-plugin/runtime.ts'
    });
    
    api.writeTmpFile({
      path: tmpPath,