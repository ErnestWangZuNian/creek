# @creekjs/web-components

基于 Ant Design 的业务组件库，提供开箱即用的企业级 React  组件。

## 📦 安装

```bash
npm install @creekjs/web-components
# 或
pnpm add @creekjs/web-components
# 或
yarn add @creekjs/web-components
```

## 🔧 依赖

- `@ant-design/icons`: ^5.5.1
- `@ant-design/pro-components`: ^2.7.18
- `antd-style`: ^3.7.1
- `zustand`: ^5.0.1

## 📚 组件列表

### 🎨 布局组件

#### CreekLayout
企业级布局组件，提供完整的页面布局解决方案。

```tsx
import { CreekLayout } from '@creekjs/web-components';

function App() {
  return (
    <CreekLayout
      showFullScreen={true}
      showLocaleButton={true}
      showSettingsButton={true}
      keepAlive={true}
    >
      {/* 你的页面内容 */}
    </CreekLayout>
  );
}
```

**特性**:
- 响应式布局 & 侧边栏折叠
- 面包屑导航与页面保活 (`CreekKeepAlive`)
- 异常页面处理
- 内置全屏、国际化、以及**主题配置抽屉 (LayoutSettings)**
- 支持动态修改主题色并同步影响所有链接和组件 (`colorPrimary` / `colorLink`)

#### BgCenter
背景居中组件，用于页面背景处理。

```tsx
import { BgCenter } from '@creekjs/web-components';

<BgCenter>
  <div>居中内容</div>
</BgCenter>
```

### 🔍 搜索组件

#### CreekSearch
高级搜索组件，支持多种搜索条件和筛选器。

```tsx
import { CreekSearch } from '@creekjs/web-components';

const searchConfig = {
  fields: [
    {
      name: 'keyword',
      label: '关键词',
      type: 'input'
    },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' }
      ]
    }
  ]
};

function SearchDemo() {
  const handleSearch = (values) => {
    console.log('搜索条件:', values);
  };

  return (
    <CreekSearch
      config={searchConfig}
      onSearch={handleSearch}
    />
  );
}
```

**特性**:
- 多种搜索字段类型
- 搜索条件显示
- 值选择器
- 搜索输入框
- 筛选器显示

### 📊 表格组件

#### SearchTable (原 CreekTable)
基于 Ant Design ProTable 的增强型业务表格组件。它在 `ProTable` 的基础上解决了高度计算、列宽自适应、表头溢出、列宽拖拽等常见痛点，真正做到开箱即用。

```tsx
import { SearchTable } from '@creekjs/web-components';

const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    width: 120,
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
    width: 80,
  },
  {
    title: '操作',
    key: 'action',
    // 开启自动宽度测量后，无需硬编码固定宽度，系统会自动测量其内部元素宽度
    render: (_, record) => (
      <a onClick={() => handleEdit(record)}>编辑</a>
    ),
  },
];

function TableDemo() {
  return (
    <SearchTable
      columns={columns}
      request={async (params) => {
        // 请求数据
        const response = await fetchData(params);
        return {
          data: response.data,
          total: response.total,
          success: true,
        };
      }}
      rowKey="id"
      // 增强特性配置：
      pageFixedBottom={true} // 分页器是否始终固定在底部
      showIndex={true} // 是否自动展示序号列 (支持翻页连续计算)
      resizable={true} // 是否支持拖拽调整列宽
    />
  );
}
```

**增强特性**:
- **自动高度计算 (`useTableScrollHeight`)**：根据页面剩余空间自动计算表格内容区域高度 (`scroll.y`)，确保分页器固定在底部 (`pageFixedBottom: true`)，页面不会出现双滚动条。
- **自动列宽计算 (`useAutoWidthColumns`)**：智能测量并分配操作列或动态内容列的宽度，防止内容被截断或挤压。
- **内置拖拽列宽 (`useResizableColumns`)**：开箱即用的列宽拖拽调整能力 (`resizable: true`)。
- **自动序号列 (`useIndexColumn`)**：一行配置 (`showIndex: true`) 即可生成全局连续的序号列（自动处理翻页逻辑）。
- **默认截断省略 (`useEllipsisColumns`)**：默认开启所有文本列的溢出省略 (`ellipsis: true`)。
- **布局优化 (`useTableOptions`)**：自带默认紧凑型布局，没有 HeaderTitle 时操作栏自动左对齐。

### ⚙️ 配置组件

#### CreekConfigProvider
全局配置提供者，整合了 `antd` 的 `ConfigProvider` 和全局上下文，自动接收并应用 `useLayoutSettingsStore` 中持久化的主题设置。

```tsx
import { CreekConfigProvider } from '@creekjs/web-components';

function App() {
  return (
    <CreekConfigProvider
      theme={{
        token: {
          colorPrimary: '#00c07f', // 默认主色调
        }
      }}
    >
      <YourApp />
    </CreekConfigProvider>
  );
}
```

**特性**:
- 内置 `useApp` 机制，提供命令式弹窗/抽屉（`drawer.open` / `modal.open`）
- 内置 `CreekI18nProvider` 处理多语言
- 自动合并用户在设置抽屉中修改的 `colorPrimary`（并将其同步为 `colorLink` 的颜色）

### 🛠️ Hook 扩展

#### useApp (弹窗/抽屉快捷调用)
提供了一套基于上下文的快捷方法，用于在应用任何地方命令式地调起 `Modal` 或 `Drawer`，并特别支持了针对 `@ant-design/pro-components` 的 `ModalForm` 和 `DrawerForm` 的无缝集成。

**核心优势**：
- **告别 `visible` / `open` state**：不再需要在父组件中维护一堆开关状态和冗长的 JSX 标签。
- **自动上下文继承**：基于 `CreekConfigProvider` 内部包裹的 `AppProvider`，弹出的弹窗/抽屉天然继承 Redux/Zustand、React Router、以及 i18n 等所有上下文（不像传统的 `Modal.confirm` 会丢失上下文）。
- **原生支持 ProForm**：提供了 `openForm` 方法，专门用于挂载 `ModalForm` / `DrawerForm`，表单的 `onFinish` 等逻辑均可正常运作。

**使用示例：**

```tsx
import { useApp } from '@creekjs/web-components';
import { Button, Form, Input } from 'antd';
import { ModalForm, ProFormText } from '@ant-design/pro-components';

export default function Demo() {
  const { modal, drawer } = useApp();

  // 1. 打开普通弹窗
  const handleOpenNormalModal = () => {
    modal.open({
      title: '普通弹窗',
      content: <div>这里是弹窗内容</div>,
      onOk: () => {
        console.log('点击了确定');
        modal.close();
      }
    });
  };

  // 2. 打开表单抽屉 (DrawerForm)
  const handleOpenFormDrawer = () => {
    drawer.openForm({
      title: '新建用户',
      width: 400,
      content: (
        <>
          <ProFormText name="username" label="用户名" rules={[{ required: true }]} />
          <ProFormText name="email" label="邮箱" />
        </>
      ),
      onFinish: async (values) => {
        console.log('表单提交:', values);
        // 返回 true 会自动关闭抽屉
        return true; 
      }
    });
  };

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <Button onClick={handleOpenNormalModal}>打开弹窗</Button>
      <Button type="primary" onClick={handleOpenFormDrawer}>打开表单抽屉</Button>
    </div>
  );
}
```

### 🎯 工具组件

#### CreekIcon
图标组件，基于 Ant Design Icons。

```tsx
import { CreekIcon } from '@creekjs/web-components';

<CreekIcon type="user" />
<CreekIcon type="setting" size={24} />
```

#### CreekLoading
加载组件，提供统一的加载状态显示。

```tsx
import { CreekLoading } from '@creekjs/web-components';

<CreekLoading spinning={loading}>
  <div>内容区域</div>
</CreekLoading>
```

#### CreekKeepAlive
组件缓存，保持组件状态。

```tsx
import { CreekKeepAlive } from '@creekjs/web-components';

<CreekKeepAlive cacheKey="unique-key">
  <YourComponent />
</CreekKeepAlive>
```

### 🪝 Hooks

#### useViewportHeight
获取视口高度的 Hook。

```tsx
import { useViewportHeight } from '@creekjs/web-components';

function MyComponent() {
  const viewportHeight = useViewportHeight();
  
  return (
    <div style={{ height: viewportHeight }}>
      全屏内容
    </div>
  );
}
```

## 🎨 主题定制

组件库基于 `antd-style` 提供主题定制能力：

```tsx
import { CreekConfigProvider } from '@creekjs/web-components';

const customTheme = {
  token: {
    colorPrimary: '#00b96b',
    borderRadius: 6,
  },
  components: {
    Button: {
      colorPrimary: '#00b96b',
    },
  },
};

<CreekConfigProvider theme={customTheme}>
  <App />
</CreekConfigProvider>
```

## 📱 响应式设计

所有组件都支持响应式设计，自动适配不同屏幕尺寸：

- 桌面端：完整功能展示
- 平板端：适配中等屏幕
- 移动端：优化触摸操作

## 🔧 开发指南

### 本地开发

```bash
# 克隆项目
git clone <repository-url>

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run father:dev

# 构建
pnpm run father:build
```

### 组件开发规范

1. **组件命名**：使用 `Creek` 前缀
2. **文件结构**：每个组件一个文件夹
3. **类型定义**：使用 TypeScript 严格模式
4. **样式方案**：使用 `antd-style`
5. **状态管理**：使用 `zustand`

### 组件结构示例