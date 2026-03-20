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
- **简介**: PC 端高级业务组件库与 Hook 集合。
- **功能**: 
  - **`SearchTable`**: 增强型业务表格，内置高度自动计算防双滚动条、列宽智能测量、拖拽调整列宽、翻页连续序号等企业级痛点解决方案。
  - **`useApp`**: 优雅的命令式弹窗 Hook。告别繁琐的 state 管理，一行代码即可调起 Modal / Drawer，无缝继承全局上下文，并原生支持调起 `@ant-design/pro-components` 的 `ModalForm` 和 `DrawerForm`。
  - **`CreekLayout`**: 增强型布局容器。内置右侧滑出的“系统设置面板”，支持全局主题色动态切换、一键切换全屏、多语言，并提供开箱即用的多标签页缓存 (`CreekKeepAlive`)。
  - **`CreekConfigProvider`**: 全局配置提供者，监听布局设置的主题变化并自动同步给内部所有组件（包括弹窗）。

### @creekjs/taro-adapter
- **简介**: 多端适配增强。
- **功能**: 为 Taro 跨端开发提供的底层抹平方案和适配工具，解决小程序和 H5 之间的差异。
