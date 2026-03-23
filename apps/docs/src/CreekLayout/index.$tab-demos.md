---
title: 交互演示
---

下面是一个包含了上述所有特性的综合演示。

值得注意的是，在这个演示中我们还展示了基于 `useApp` 的**优雅弹窗与抽屉调用方式**。在传统开发中，我们通常需要为每一个弹窗或抽屉定义 `visible` 状态，导致组件内充斥着大量的 `useState`。而通过 Creek 提供的 `useApp` Hook，你可以**完全以命令式的方式**（`modal.open` / `drawer.openForm`）调起它们，彻底告别来回写状态的烦恼，同时还能完美兼容 ProComponents 的高级表单能力！

<code src="./index.tsx"></code>
