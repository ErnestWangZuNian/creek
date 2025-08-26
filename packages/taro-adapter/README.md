# @creekjs/taro-adapter

Taro 小程序开发的 Axios 适配器，让你在 Taro 项目中无缝使用 Axios。

## 特性

- 🚀 完全兼容 Axios API
- 📱 支持所有 Taro 支持的小程序平台
- 📁 支持文件上传
- 📊 支持上传进度监听
- ⚡ 支持请求中断
- 🛠️ TypeScript 支持

## 安装

```bash
npm install @creekjs/taro-adapter
# 或
yarn add @creekjs/taro-adapter
```

## 基础用法

```typescript
import axios from 'axios';
import { taroAdapter } from '@creekjs/taro-adapter';

// 配置 Taro 适配器
axios.defaults.adapter = taroAdapter;

// 现在可以正常使用 Axios
const response = await axios.get('https://api.example.com/users');
console.log(response.data);
```

## 与 @creekjs/request 集成

```typescript
import { request } from '@creekjs/request';
import { taroAdapter } from '@creekjs/taro-adapter';

// 为 request 实例配置适配器
request.instance.defaults.adapter = taroAdapter;

// 或者创建专用的 Taro 实例
const taroRequest = request.createInstance({
  adapter: taroAdapter,
  baseURL: 'https://api.example.com'
});

// 正常使用
const users = await taroRequest.get('/users');
```

## 文件上传

### 基础文件上传

```typescript
import Taro from '@tarojs/taro';
import { FileData } from '@creekjs/taro-adapter';

// 选择文件
const chooseResult = await Taro.chooseImage({
  count: 1,
  sizeType: ['original', 'compressed'],
  sourceType: ['album', 'camera']
});

// 创建文件数据
const fileData = new FileData({
  path: chooseResult.tempFilePaths[0],
  name: 'avatar.jpg',
  type: 'image/jpeg'
});

// 上传文件
const response = await axios.post('/api/upload', {
  file: fileData,
  userId: 123
});
```

### 多文件上传

```typescript
const chooseResult = await Taro.chooseImage({
  count: 9,
  sizeType: ['compressed'],
  sourceType: ['album']
});

const files = chooseResult.tempFilePaths.map((path, index) => 
  new FileData({
    path,
    name: `image_${index}.jpg`,
    type: 'image/jpeg'
  })
);

const response = await axios.post('/api/upload/multiple', {
  files,
  albumId: 456
});
```

### 上传进度监听

```typescript
const response = await axios.post('/api/upload', 
  { file: fileData },
  {
    onUploadProgress: (progressEvent) => {
      const progress = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`上传进度: ${progress}%`);
      
      // 更新 UI
      Taro.showToast({
        title: `上传中 ${progress}%`,
        icon: 'loading',
        duration: 100
      });
    }
  }
);
```

## 请求中断

```typescript
import axios from 'axios';

// 创建取消令牌
const source = axios.CancelToken.source();

// 发起请求
const requestPromise = axios.get('/api/data', {
  cancelToken: source.token
});

// 5秒后取消请求
setTimeout(() => {
  source.cancel('请求超时');
}, 5000);

try {
  const response = await requestPromise;
  console.log(response.data);
} catch (error) {
  if (axios.isCancel(error)) {
    console.log('请求被取消:', error.message);
  } else {
    console.error('请求失败:', error);
  }
}
```

## API 参考

### taroAdapter

主要的适配器函数，将 Axios 请求转换为 Taro 请求。

```typescript
function taroAdapter(config: AxiosRequestConfig): Promise<AxiosResponse>
```

### FileData 类

用于封装文件数据的工具类。

```typescript
class FileData {
  constructor(options: {
    path: string;      // 文件路径
    name?: string;     // 文件名
    type?: string;     // MIME 类型
  })
  
  getFileContent(): {
    filePath: string;
    name: string;
    type?: string;
  }
}
```

### PostData 类

用于处理包含文件的表单数据。

```typescript
class PostData<T> {
  constructor(data: T)
  
  getParsedPostData(): {
    normalData: T;     // 普通数据
    fileData: T;       // 文件数据
  }
}
```

## 工具函数

### 对象合并

```typescript
import { merge } from '@creekjs/taro-adapter/utils';

const result = merge(
  { a: 1, b: { c: 2 } },
  { b: { d: 3 }, e: 4 }
);
// 结果: { a: 1, b: { c: 2, d: 3 }, e: 4 }
```

### URL 构建

```typescript
import { buildUrl, buildFullPath } from '@creekjs/taro-adapter/utils';

// 构建带参数的 URL
const url = buildUrl('/api/users', { page: 1, size: 10 });
// 结果: '/api/users?page=1&size=10'

// 构建完整路径
const fullPath = buildFullPath('https://api.example.com', '/users');
// 结果: 'https://api.example.com/users'
```

### 类型检查

```typescript
import { isString, isObject } from '@creekjs/taro-adapter/utils';

if (isString(value)) {
  // value 是 string 类型
}

if (isObject(value)) {
  // value 是 object 类型
}
```

## 在不同平台使用

### 微信小程序

```typescript
// app.config.ts
export default {
  pages: ['pages/index/index'],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  // 配置网络请求域名
  permission: {
    'scope.writePhotosAlbum': {
      desc: '保存图片到相册'
    }
  }
}
```

### 支付宝小程序

```typescript
// 支付宝小程序中的使用方式相同
import { taroAdapter } from '@creekjs/taro-adapter';
import axios from 'axios';

axios.defaults.adapter = taroAdapter;

// 正常使用 Axios API
const response = await axios.get('/api/data');
```

### H5 环境

```typescript
// 在 H5 环境中，适配器会自动降级到标准的 Axios 行为
// 无需特殊配置
```

## 错误处理

```typescript
try {
  const response = await axios.get('/api/data');
  console.log(response.data);
} catch (error) {
  if (error.response) {
    // 服务器响应错误
    console.error('响应错误:', error.response.status, error.response.data);
  } else if (error.request) {
    // 网络错误
    console.error('网络错误:', error.message);
  } else {
    // 其他错误
    console.error('请求配置错误:', error.message);
  }
}
```

## 最佳实践

### 1. 统一配置

```typescript
// utils/request.ts
import axios from 'axios';
import Taro from '@tarojs/taro';
import { taroAdapter } from '@creekjs/taro-adapter';

// 创建实例
const instance = axios.create({
  adapter: taroAdapter,
  baseURL: 'https://api.example.com',
  timeout: 10000
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 显示加载提示
    Taro.showLoading({ title: '加载中...' });
    
    // 添加认证头
    const token = Taro.getStorageSync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    Taro.hideLoading();
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    Taro.hideLoading();
    return response;
  },
  (error) => {
    Taro.hideLoading();
    
    // 统一错误处理
    Taro.showToast({
      title: error.message || '请求失败',
      icon: 'none'
    });
    
    return Promise.reject(error);
  }
);

export default instance;
```

### 2. 文件上传封装

```typescript
// utils/upload.ts
import Taro from '@tarojs/taro';
import { FileData } from '@creekjs/taro-adapter';
import request from './request';

export interface UploadOptions {
  count?: number;
  sizeType?: ('original' | 'compressed')[];
  sourceType?: ('album' | 'camera')[];
  onProgress?: (progress: number) => void;
}

export async function uploadImages(options: UploadOptions = {}) {
  const {
    count = 1,
    sizeType = ['compressed'],
    sourceType = ['album', 'camera'],
    onProgress
  } = options;
  
  try {
    // 选择图片
    const chooseResult = await Taro.chooseImage({
      count,
      sizeType,
      sourceType
    });
    
    // 创建文件数据
    const files = chooseResult.tempFilePaths.map((path, index) => 
      new FileData({
        path,
        name: `image_${Date.now()}_${index}.jpg`,
        type: 'image/jpeg'
      })
    );
    
    // 上传文件
    const response = await request.post('/api/upload', 
      { files },
      {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress?.(progress);
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('上传失败:', error);
    throw error;
  }
}
```

### 3. 请求缓存

```typescript
// utils/cache.ts
class RequestCache {
  private cache = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5分钟
  
  get(key: string) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.TTL) {
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }
  
  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  clear() {
    this.cache.clear();
  }
}

export const requestCache = new RequestCache();
```

## 注意事项

1. **平台限制**: 不同小程序平台对网络请求有不同的限制，请查阅对应平台文档
2. **域名配置**: 小程序需要在后台配置合法域名
3. **文件大小**: 注意文件上传的大小限制
4. **并发限制**: 小程序对并发请求数量有限制
5. **HTTPS**: 小程序要求使用 HTTPS 协议

## 许可证

ISC