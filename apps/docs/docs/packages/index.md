# 生态包概览

CreekJS 采用 Monorepo 架构管理，核心能力被拆分在 `packages` 目录下多个独立且可复用的 npm 包中。这保证了不同项目和终端（PC/H5/小程序）可以按需引入，避免臃肿。

以下是 CreekJS 核心生态包的详细介绍：

## 基础建设类

### @creekjs/create-creek
- **简介**: 官方项目初始化脚手架。
- **功能**: 提供交互式的 CLI，支持快速拉取和生成 `pc-demo` (中后台管理端) 和 `mobile` (Taro 多端) 模板，自动配置好项目结构和基础依赖。

### @creekjs/lint
- **简介**: 统一代码规范配置包。
- **功能**: 集合了团队推荐的 `ESLint`、`Prettier` (支持 import 自动排序)、`Stylelint` 规则。业务项目只需一行引用即可实现全量规范校验，极大降低了规范配置的成本。

### @creekjs/openapi
- **简介**: OpenAPI 接口生成器。
- **功能**: 深度集成 Umi 的 OpenAPI 插件，能够通过远程 Swagger/OpenAPI 文档地址，一键生成对应的 TypeScript 类型定义和基于 `@creekjs/request` 的请求代码。

## 核心业务类

### @creekjs/request
- **简介**: 统一网络请求库。
- **功能**: 基于 axios 封装，内置了请求拦截、响应拦截、业务错误统一处理、Token 管理等企业级应用必备的网络层能力。

### @creekjs/i18n & @creekjs/i18n-extract
- **简介**: 全局多语言解决方案。
- **功能**: 
  - **i18n**: 提供了支持 React 和 Vue 的运行时国际化库，脱离了特定框架的束缚。
  - **i18n-extract**: 强大的 CLI 工具，自动扫描代码中的中文并提取、自动替换为 `t()` Hook 调用，甚至可以解析 Umi 路由配置进行提取。

### @creekjs/cache
- **简介**: 高效的前端缓存管理。
- **功能**: 基于 `lru-cache` 等工具封装，提供内存级或 Storage 级的通用缓存接口，常用于字典数据、常用配置的持久化存储。

## 框架与 UI 增强类

### @creekjs/umi-plugins
- **简介**: Umi 框架核心插件集。
- **功能**: 包含了针对 Umi 深度定制的插件，例如 `creek-layout` 插件：可以接管默认的 ProLayout，实现自动注入自定义的多语言支持、IconFont 映射和自定义的布局按钮。

### @creekjs/web-components
- **简介**: PC 端高级业务组件库。
- **功能**: 
  - 提供了 `CreekLayout`、`CreekTable`、`CreekPageContainer` 等高级业务组件。
  - 深度封装 Ant Design Pro，解决了默认组件在高度计算、表头滚动、多语言配合等方面的问题。
  - 提供 `useApp` 集中管理全局弹窗 (Modal/Drawer) 等高级 Hook。

### @creekjs/taro-adapter
- **简介**: 多端适配增强。
- **功能**: 为 Taro 跨端开发提供的底层抹平方案和适配工具，解决小程序和 H5 之间的差异。
