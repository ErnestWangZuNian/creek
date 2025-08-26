# @creekjs/openapi

基于 OpenAPI 规范自动生成前端服务代码的工具包，支持多种数据源。

## 特性

- 🚀 支持 Swagger/OpenAPI 规范
- 🔄 自动生成 TypeScript 类型定义
- 📡 生成对应的 API 服务函数
- 🎯 支持多种数据源（Swagger、YApi）
- 🛠️ 基于 @umijs/openapi 的强大功能

## 安装

```bash
npm install @creekjs/openapi --save-dev
# 或
yarn add @creekjs/openapi -D
```

## 基础用法

```typescript
import { generateService, OpenApiChannel } from '@creekjs/openapi';

// 从 Swagger 生成服务
await generateService({
  openApiChannel: OpenApiChannel.swagger,
  schemaPath: 'https://api.example.com/swagger.json',
  serversPath: './src/services',
  requestLibPath: '@/utils/request'
});
```

## API 参考

### OpenApiChannel 枚举

```typescript
enum OpenApiChannel {
  swagger = 'swagger',
  yapi = 'yapi'  // 暂未实现
}
```

### generateService(options)

生成 API 服务代码。

**参数类型：**

```typescript
interface OpenApiGenerateServiceProps extends BaseOpenApiGenerateServiceProps {
  openApiChannel: OpenApiChannel;
}

interface BaseOpenApiGenerateServiceProps {
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

interface ApiPrefixParams {
  path: string;
  method: string;
  namespace: string;
  functionName: string;
  autoExclude?: boolean;
}
```

## 使用示例

### 基础配置

```typescript
import { generateService, OpenApiChannel } from '@creekjs/openapi';

// 基础配置
const config = {
  openApiChannel: OpenApiChannel.swagger,
  schemaPath: 'https://petstore.swagger.io/v2/swagger.json',
  serversPath: './src/services',
  requestLibPath: '@/utils/request',
  projectName: 'petstore'
};

await generateService(config);
```

### 高级配置

```typescript
// 自定义 API 前缀
const advancedConfig = {
  openApiChannel: OpenApiChannel.swagger,
  schemaPath: './openapi.json',
  serversPath: './src/api',
  requestLibPath: '@creekjs/request',
  apiPrefix: ({ path, method, namespace }) => {
    return `/${namespace}${path}`;
  },
  enumStyle: 'string-literal' as const,
  isCamelCase: true,
  nullable: false,
  dataFields: ['data', 'result']
};

await generateService(advancedConfig);
```

### 多配置支持

```typescript
// 支持数组配置，一次生成多个服务
const configs = [
  {
    openApiChannel: OpenApiChannel.swagger,
    schemaPath: 'https://api1.example.com/swagger.json',
    serversPath: './src/services/api1',
    namespace: 'api1'
  },
  {
    openApiChannel: OpenApiChannel.swagger,
    schemaPath: 'https://api2.example.com/swagger.json',
    serversPath: './src/services/api2',
    namespace: 'api2'
  }
];

for (const config of configs) {
  await generateService(config);
}
```

## 生成的代码结构

执行后会在指定目录生成以下文件：