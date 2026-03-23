---
nav:
  title: Hook
  path: /hooks
group:
  title: 核心 Hook
  order: 1
apiHeader:
  pkg: '@creekjs/web-components'
---

# useApp

优雅的弹窗与抽屉。

在传统的 React 开发中，我们通常需要为每一个弹窗或抽屉定义 `visible` 状态（例如 `const [isModalOpen, setIsModalOpen] = useState(false)`），这会导致组件内充斥着大量的状态代码，极大地影响了代码的可读性和维护性。

`useApp` 提供了一套基于上下文的快捷方法，允许你在应用的任何地方**以纯命令式的方式**调起 Modal 或 Drawer。它不仅完美解决了状态管理的烦恼，还深度集成了 `@ant-design/pro-components` 中的 `ModalForm` 和 `DrawerForm`。

## 核心优势

- **告别 State**：无需手动声明 `open` 或 `visible` 状态，代码更纯粹，心智负担更低。
- **类型安全**：完整的 TypeScript 提示，参数结构与 Ant Design 原生组件以及 ProComponents 高级表单组件完全对齐。
- **无缝集成高级表单**：直接支持通过 `openForm` 调起表单抽屉或弹窗，在 `onFinish` 中处理提交逻辑，提交成功（返回 `true`）后组件会自动关闭。

## 前提条件

由于 `useApp` 依赖于全局上下文来挂载弹窗和抽屉，你需要确保在应用的最外层使用了 `CreekConfigProvider` 进行包裹（如果你使用的是 `CreekLayout`，它内部已经默认包裹了 `CreekConfigProvider`）。

```tsx | pure
import { CreekConfigProvider } from '@creekjs/web-components';

export default () => (
  <CreekConfigProvider>
    <App />
  </CreekConfigProvider>
);
```