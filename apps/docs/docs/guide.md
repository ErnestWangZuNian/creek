# 快速开始

CreekJS 是一套现代化的前端工程解决方案。通过它，你可以快速初始化一个带有最佳实践的企业级中后台项目或移动端应用。

## 安装

我们推荐使用 `pnpm` 作为包管理工具，因为它速度更快且对磁盘空间更友好。

```bash
# 全局安装 create-creek 脚手架
npm install -g @creekjs/create-creek
```

## 创建项目

使用脚手架快速生成项目：

```bash
create-creek my-app
```

脚手架会引导你选择需要的模板：
- **PC 管理端模板**: 基于 Umi Max, Ant Design Pro 打造的完善中后台。
- **Mobile 移动端模板**: 基于 Taro 打造的多端应用模板。

## 目录结构

项目采用了 Turborepo 进行 Monorepo 管理：

```text
creek/
├── apps/               # 业务应用目录
│   ├── pc-demo/        # PC 端示例应用
│   ├── mobile/         # 移动端示例应用
│   └── docs/           # 项目文档站点
├── packages/           # 核心生态包目录
│   ├── cache/          # 缓存处理工具
│   ├── create-creek/   # 项目初始化脚手架
│   ├── i18n/           # 国际化核心库
│   ├── i18n-extract/   # 国际化文案提取 CLI
│   ├── lint/           # 统一规范配置 (ESLint/Prettier/Stylelint)
│   ├── openapi/        # OpenAPI 接口代码生成器
│   ├── request/        # 网络请求封装库
│   ├── taro-adapter/   # Taro 适配器
│   ├── umi-plugins/    # Umi 核心增强插件集
│   └── web-components/ # PC 端业务组件库
└── package.json
```

## 开发脚本

在项目根目录下运行：

```bash
# 安装所有依赖
pnpm install

# 启动所有项目开发服务器
pnpm dev

# 构建所有包和应用
pnpm build

# 运行全量代码格式化和检查
pnpm lint
pnpm format
```
