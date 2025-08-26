# @creekjs/cache

一个功能强大的缓存管理库，支持多种存储方式，提供统一的API接口。

## 特性

- 🚀 支持多种存储类型：localStorage、sessionStorage、LRU缓存
- 🔧 统一的API接口，易于切换存储方式
- 📦 支持命名空间，避免键名冲突
- 🛡️ 内置序列化/反序列化，支持复杂数据类型
- ⚡ 轻量级，无额外依赖（除LRU缓存）

## 安装

```bash
npm install @creekjs/cache
# 或
yarn add @creekjs/cache
```

## 基础用法

### 创建存储实例

```typescript
import { createStore } from '@creekjs/cache';

// 使用 localStorage
const localStore = createStore({
  type: 'localStorage',
  namespace: 'myApp'
});

// 使用 sessionStorage
const sessionStore = createStore({
  type: 'sessionStorage',
  namespace: 'myApp'
});

// 使用 LRU 缓存
const lruStore = createStore({
  type: 'lruCache',
  namespace: 'myApp',
  max: 100, // 最大缓存数量
  ttl: 1000 * 60 * 5 // 5分钟过期
});
```

### 基本操作

```typescript
// 存储数据
store.set('user', { id: 1, name: 'John' });
store.set('settings', { theme: 'dark', lang: 'zh' });

// 获取数据
const user = store.get('user'); // { id: 1, name: 'John' }
const theme = store.get('settings.theme'); // 支持路径访问

// 检查是否存在
if (store.get('user')) {
  console.log('用户已登录');
}
```

## API 参考

### createStore(options)

创建一个存储实例。

**参数：**
- `options.type`: 存储类型，可选值：`'localStorage'` | `'sessionStorage'` | `'lruCache'`
- `options.namespace`: 命名空间，用于避免键名冲突
- `options.max`: (仅LRU) 最大缓存数量
- `options.ttl`: (仅LRU) 缓存过期时间（毫秒）

**返回：** Store 实例

### Store 实例方法

#### set(key, value)

存储数据。

```typescript
store.set('key', 'value');
store.set('user', { id: 1, name: 'John' });
```

#### get(key)

获取数据。

```typescript
const value = store.get('key');
const user = store.get('user');
```

## 存储类型对比

| 特性 | localStorage | sessionStorage | lruCache |
|------|-------------|----------------|----------|
| 持久化 | ✅ 永久保存 | ❌ 会话结束清除 | ❌ 内存存储 |
| 容量限制 | ~5-10MB | ~5-10MB | 可配置 |
| 性能 | 中等 | 中等 | 高 |
| 过期控制 | ❌ | ❌ | ✅ |
| 跨标签页 | ✅ | ❌ | ❌ |

## 最佳实践

### 1. 选择合适的存储类型

```typescript
// 用户设置 - 需要持久化
const settingsStore = createStore({ type: 'localStorage', namespace: 'settings' });

// 临时数据 - 会话级别
const tempStore = createStore({ type: 'sessionStorage', namespace: 'temp' });

// 频繁访问的数据 - 高性能缓存
const cacheStore = createStore({ 
  type: 'lruCache', 
  namespace: 'cache',
  max: 1000,
  ttl: 1000 * 60 * 10 // 10分钟
});
```

### 2. 使用命名空间

```typescript
// 为不同模块使用不同命名空间
const userStore = createStore({ type: 'localStorage', namespace: 'user' });
const appStore = createStore({ type: 'localStorage', namespace: 'app' });
```

### 3. 错误处理

```typescript
try {
  const data = store.get('key');
  if (data) {
    // 处理数据
  }
} catch (error) {
  console.error('缓存读取失败:', error);
}
```

## 注意事项

1. **浏览器兼容性**: localStorage 和 sessionStorage 需要现代浏览器支持
2. **存储限制**: 浏览器存储有容量限制，建议不要存储过大的数据
3. **序列化**: 复杂对象会被自动序列化，注意函数和循环引用会丢失
4. **安全性**: 不要存储敏感信息，localStorage 数据可被用户访问

## 许可证

ISC