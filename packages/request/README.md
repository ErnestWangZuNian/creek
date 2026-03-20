# @creekjs/request

基于 Axios 的增强型 HTTP 请求库，提供插件系统和丰富的功能扩展。

## 特性

- 🚀 基于 Axios，保持 API 兼容性
- 🔌 插件系统，支持功能扩展
- 🔄 内置防重复请求插件
- ⏳ 内置加载状态管理插件
- 🛠️ 支持多实例管理
- 📦 TypeScript 支持

## 安装

```bash
npm install @creekjs/request
# 或
yarn add @creekjs/request
```

## 基础用法

```typescript
import { request } from '@creekjs/request';

// GET 请求
const users = await request.get('/api/users');

// POST 请求
const newUser = await request.post('/api/users', {
  name: 'John',
  email: 'john@example.com'
});

// 使用配置对象
const response = await request({
  url: '/api/users',
  method: 'GET',
  params: { page: 1, size: 10 }
});
```

## 插件系统

### 使用内置插件

```typescript
import { request, plugins } from '@creekjs/request';

// 使用加载插件
request.pluginManager.use(new plugins.LoadingPlugin({
  showLoading: () => console.log('开始加载...'),
  hideLoading: () => console.log('加载完成')
}));

// 使用防重复请求插件
request.pluginManager.use(new plugins.DuplicatePlugin());
```

### 自定义插件

```typescript
import { plugins } from '@creekjs/request';

class LoggerPlugin extends plugins.AxiosPlugin {
  beforeRequest(config) {
    console.log('请求开始:', config.url);
    return config;
  }

  afterRequest(response) {
    console.log('请求成功:', response.config.url);
    return response;
  }

  onError(error) {
    console.error('请求失败:', error.config?.url);
    return Promise.reject(error);
  }
}

// 使用自定义插件
request.pluginManager.use(new LoggerPlugin());
```

## API 参考

### request 对象

```typescript
// 主要方法
request(config: AxiosRequestConfig): Promise<AxiosResponse>
request.get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>
request.post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse>
request.put(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse>
request.delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>

// 实例管理
request.instance: AxiosInstance
request.pluginManager: AxiosPluginManager
request.createInstance(config?: AxiosRequestConfig): typeof request
```

### 插件基类

```typescript
abstract class AxiosPlugin {
  // 插件初始化
  init?(instance: AxiosInstance): void;
  
  // 请求前钩子
  beforeRequest?(config: AxiosRequestConfig): AxiosRequestConfig | Promise<AxiosRequestConfig>;
  
  // 请求后钩子
  afterRequest?(response: AxiosResponse): AxiosResponse | Promise<AxiosResponse>;
  
  // 错误处理钩子
  onError?(error: AxiosError): any;
}
```

### 插件管理器

```typescript
class AxiosPluginManager {
  // 注册插件
  use(plugin: AxiosPlugin): void;
  
  // 设置拦截器（内部使用）
  setupInterceptors(instance: AxiosInstance): void;
}
```

## 内置插件

### LoadingPlugin - 加载状态管理

```typescript
interface LoadingPluginOptions {
  showLoading: () => void;    // 显示加载状态
  hideLoading: () => void;    // 隐藏加载状态
}

const loadingPlugin = new plugins.LoadingPlugin({
  showLoading: () => {
    // 显示全局加载指示器
    document.getElementById('loading').style.display = 'block';
  },
  hideLoading: () => {
    // 隐藏全局加载指示器
    document.getElementById('loading').style.display = 'none';
  }
});

request.pluginManager.use(loadingPlugin);
```

**特性：**
- 自动管理请求计数
- 支持并发请求的加载状态
- 请求完成或失败时自动隐藏加载状态

### DuplicatePlugin - 防重复请求

```typescript
const duplicatePlugin = new plugins.DuplicatePlugin({
  throwDuplicateError: false, // 是否将重复请求的错误抛出，默认 false (静默拦截并打印警告)
  cooldownInterval: 0,        // 请求完成后的冷却时间(ms)，默认 0
});
request.pluginManager.use(duplicatePlugin);

// 快速连续发送相同请求，只有第一个会执行
request.get('/api/users'); // 执行
request.get('/api/users'); // 被静默拦截，控制台打印警告
```

**特性：**
- 基于请求 URL、方法和参数生成唯一标识
- 自动管理请求队列
- 路由切换时自动清理锁（防止页面快速切换导致新请求被误拦截）
- 默认静默处理重复请求，避免报错冒泡到业务层引发全局 Toast 提示

## 高级用法

### 创建多个实例

```typescript
import { request } from '@creekjs/request';

// 创建 API 实例
const apiRequest = request.createInstance({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer token'
  }
});

// 创建上传实例
const uploadRequest = request.createInstance({
  baseURL: 'https://upload.example.com',
  timeout: 30000
});

// 为不同实例配置不同插件
apiRequest.pluginManager.use(new plugins.DuplicatePlugin());
uploadRequest.pluginManager.use(new plugins.LoadingPlugin({
  showLoading: () => console.log('上传中...'),
  hideLoading: () => console.log('上传完成')
}));
```

### 请求拦截器

```typescript
// 请求拦截器
request.instance.interceptors.request.use(
  (config) => {
    // 添加认证头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.instance.interceptors.response.use(
  (response) => {
    // 统一处理响应数据
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      // 跳转到登录页
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 与 React 集成

```typescript
// hooks/useApi.ts
import { useState, useEffect } from 'react';
import { request } from '@creekjs/request';

export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await request.get(url);
        setData(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// 使用
function UserList() {
  const { data: users, loading, error } = useApi<User[]>('/api/users');

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  
  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## 最佳实践

### 1. 统一错误处理

```typescript
class ErrorHandlerPlugin extends plugins.AxiosPlugin {
  onError(error) {
    const { response } = error;
    
    switch (response?.status) {
      case 401:
        // 未授权，跳转登录
        this.redirectToLogin();
        break;
      case 403:
        // 无权限
        this.showMessage('无权限访问');
        break;
      case 500:
        // 服务器错误
        this.showMessage('服务器错误，请稍后重试');
        break;
      default:
        this.showMessage(error.message || '请求失败');
    }
    
    return Promise.reject(error);
  }
  
  private redirectToLogin() {
    window.location.href = '/login';
  }
  
  private showMessage(message: string) {
    // 显示错误消息
    console.error(message);
  }
}
```

### 2. 请求重试

```typescript
class RetryPlugin extends plugins.AxiosPlugin {
  constructor(private maxRetries = 3) {
    super();
  }
  
  async onError(error) {
    const config = error.config;
    
    if (!config || config.__retryCount >= this.maxRetries) {
      return Promise.reject(error);
    }
    
    config.__retryCount = (config.__retryCount || 0) + 1;
    
    // 延迟重试
    await new Promise(resolve => setTimeout(resolve, 1000 * config.__retryCount));
    
    return request(config);
  }
}
```

### 3. 缓存插件

```typescript
class CachePlugin extends plugins.AxiosPlugin {
  private cache = new Map();
  
  beforeRequest(config) {
    if (config.method === 'get') {
      const key = this.getCacheKey(config);
      const cached = this.cache.get(key);
      
      if (cached && Date.now() - cached.timestamp < 60000) { // 1分钟缓存
        return Promise.resolve(cached.data);
      }
    }
    
    return config;
  }
  
  afterRequest(response) {
    if (response.config.method === 'get') {
      const key = this.getCacheKey(response.config);
      this.cache.set(key, {
        data: response,
        timestamp: Date.now()
      });
    }
    
    return response;
  }
  
  private getCacheKey(config) {
    return `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
  }
}
```

## 许可证

ISC