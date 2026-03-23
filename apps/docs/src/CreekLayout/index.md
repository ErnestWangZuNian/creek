---
nav:
  title: 组件
  path: /components
group:
  title: 核心组件
  order: 2
apiHeader:
  pkg: '@creekjs/web-components'
---

# CreekLayout (增强型布局容器)

`CreekLayout` 是基于 `@ant-design/pro-components` 中的 `ProLayout` 的深度增强组件，为企业级中后台系统提供了开箱即用的高级布局能力。

它内置了众多复杂的页面交互与状态管理逻辑，使得开发者无需手动维护这些常见但繁琐的功能。

## 相比原生 ProLayout 的核心增强

### 1. 响应式布局与侧边栏折叠状态管理 (`useCollapsedStore`)
- **说明**：内置了 Zustand 状态管理，自动处理屏幕缩放时的侧边栏折叠状态。

### 2. 内置页面保活 (`CreekKeepAlive`)
- **说明**：默认集成了多标签页缓存能力，在复杂的表单或列表页面切换时，能够完美保持组件的状态不丢失。可通过 `keepAlive={true}` 开启。

### 3. 主题与布局配置面板 (`LayoutSettings`)
- **说明**：内置了右侧滑出的“系统设置面板”，支持：
  - 动态切换全局主题色，并自动同步影响所有关联链接和组件的颜色 (`colorPrimary` / `colorLink`)
  - 一键切换全屏模式 (`showFullScreen`)
  - 开启/关闭多语言切换按钮 (`showLocaleButton`)
  - 开启/关闭页面缓存 (`keepAlive`)
- 配置会自动持久化到本地 (`useLayoutSettingsStore`)。

### 4. 内置全屏与国际化能力
- **说明**：直接内置了全屏切换 (`FullScreen`) 组件和国际化语言切换按钮 (`CreekLocaleButton`)，并可通过 props 或设置面板轻松控制其显示隐藏。

---

## 额外高阶 API 

`CreekLayout` 完全继承了 `ProLayout` 的所有属性，并在此基础上新增了以下高阶属性配置：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `runtimeConfig` | 运行时布局配置 | `ProLayoutProps` | 必填 |
| `userConfig` | 用户自定义布局配置 | `ProLayoutProps` | - |
| `navigate` | 路由跳转方法 | `(path?: string \| number) => void` | - |
| `showFullScreen` | 是否展示顶部全屏切换按钮 | `boolean` | `false` |
| `showLocaleButton` | 是否展示顶部国际化切换按钮 | `boolean` | `true` |
| `showSettingsButton` | 是否展示顶部系统设置按钮 | `boolean` | `true` |
| `keepAlive` | 是否开启多标签页缓存能力 | `boolean \| CreekKeepAliveProps` | `true` |
| `initialInfo` | 初始化信息 (Umi `@@initialState` 对应的数据) | `{ initialState: any; loading: boolean; setInitialState: () => void }` | - |
| `extraActions` | 顶部右侧额外注入的操作区域节点 | `React.ReactNode[]` | `[]` |
