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
    <CreekLayout>
      {/* 你的页面内容 */}
    </CreekLayout>
  );
}
```

**特性**:
- 响应式布局
- 侧边栏折叠
- 面包屑导航
- 异常页面处理
- 头部内容自定义

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

#### CreekTable
增强型表格组件，基于 Ant Design Pro Table。

```tsx
import { CreekTable } from '@creekjs/web-components';

const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <a onClick={() => handleEdit(record)}>编辑</a>
    ),
  },
];

function TableDemo() {
  return (
    <CreekTable
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
    />
  );
}
```

**特性**:
- 搜索表格集成
- 工具栏渲染
- 表格视图内容
- 表格选项渲染
- 自定义 hooks 支持

### ⚙️ 配置组件

#### CreekConfigProvider
全局配置提供者，管理主题和全局设置。

```tsx
import { CreekConfigProvider } from '@creekjs/web-components';

function App() {
  return (
    <CreekConfigProvider
      theme={{
        primaryColor: '#1890ff',
        // 其他主题配置
      }}
    >
      <YourApp />
    </CreekConfigProvider>
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