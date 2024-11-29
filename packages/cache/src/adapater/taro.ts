import LRU, { Options as LRUOptions } from 'lru-cache';

// 缓存类型枚举
enum CacheType {
  MEMORY = 'memory',
  LOCAL_STORAGE = 'localStorage',
  SESSION_STORAGE = 'sessionStorage',
  INDEXED_DB = 'indexedDB'
}

// 缓存配置接口（继承 LRU 配置）
interface CacheConfig<V = any> extends LRUOptions<string, V> {
  type?: CacheType;
  dbName?: string;
  storeName?: string;
}

// 缓存项结构
interface CacheItem<T> {
  value: T;
  expires: number;
  metadata?: Record<string, any>;
}

class AdvancedCacheManager {
  private memoryCache: LRU<string, any>;
  private indexedDB: IDBDatabase | null = null;

  private defaultConfig: CacheConfig = {
    type: CacheType.MEMORY,
    max: 100,
    maxAge: 1000 * 60 * 60, // 1小时
    dbName: 'AppCache',
    storeName: 'keyValueStore'
  };

  constructor() {
    this.memoryCache = new LRU(this.defaultConfig);
    this.initIndexedDB();
  }

  private async initIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.defaultConfig.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.defaultConfig.storeName)) {
          db.createObjectStore(this.defaultConfig.storeName);
        }
      };

      request.onsuccess = () => {
        this.indexedDB = request.result;
        resolve(this.indexedDB);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // 设置缓存
  set<T>(key: string, value: T, config: CacheConfig<T> = {}): Promise<void> | void {
    const finalConfig = { ...this.defaultConfig, ...config };
    const cacheItem: CacheItem<T> = {
      value,
      expires: Date.now() + (finalConfig.maxAge || 0),
      metadata: finalConfig
    };

    switch (finalConfig.type) {
      case CacheType.MEMORY:
        this.memoryCache.set(key, cacheItem, { 
          ttl: finalConfig.maxAge,
          sizeCalculation: finalConfig.sizeCalculation
        });
        break;
      
      case CacheType.LOCAL_STORAGE:
        localStorage.setItem(key, JSON.stringify(cacheItem));
        break;
      
      case CacheType.SESSION_STORAGE:
        sessionStorage.setItem(key, JSON.stringify(cacheItem));
        break;
      
      case CacheType.INDEXED_DB:
        return this.setIndexedDB(key, cacheItem, finalConfig);
    }
  }

  // IndexedDB 专用的异步设置方法
  private async setIndexedDB<T>(
    key: string, 
    cacheItem: CacheItem<T>, 
    config: CacheConfig<T>
  ): Promise<void> {
    await this.ensureIndexedDBInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction([config.storeName!], 'readwrite');
      const store = transaction.objectStore(config.storeName!);
      const request = store.put(cacheItem, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 获取缓存
  get<T>(key: string, config: CacheConfig<T> = {}): Promise<T | null> | T | null {
    const finalConfig = { ...this.defaultConfig, ...config };

    switch (finalConfig.type) {
      case CacheType.MEMORY:
        return this.validateCacheItem(this.memoryCache.get(key));
      
      case CacheType.LOCAL_STORAGE:
        return this.validateCacheItem(JSON.parse(localStorage.getItem(key) || 'null'));
      
      case CacheType.SESSION_STORAGE:
        return this.validateCacheItem(JSON.parse(sessionStorage.getItem(key) || 'null'));
      
      case CacheType.INDEXED_DB:
        return this.getIndexedDB(key, finalConfig);
    }
  }

  // IndexedDB 专用的异步获取方法
  private async getIndexedDB<T>(
    key: string, 
    config: CacheConfig<T>
  ): Promise<T | null> {
    await this.ensureIndexedDBInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction([config.storeName!], 'readonly');
      const store = transaction.objectStore(config.storeName!);
      const request = store.get(key);

      request.onsuccess = () => resolve(this.validateCacheItem(request.result));
      request.onerror = () => reject(request.error);
    });
  }

  // 删除缓存
  delete(key: string, config: CacheConfig = {}): Promise<void> | void {
    const finalConfig = { ...this.defaultConfig, ...config };

    switch (finalConfig.type) {
      case CacheType.MEMORY:
        this.memoryCache.delete(key);
        break;
      
      case CacheType.LOCAL_STORAGE:
        localStorage.removeItem(key);
        break;
      
      case CacheType.SESSION_STORAGE:
        sessionStorage.removeItem(key);
        break;
      
      case CacheType.INDEXED_DB:
        return this.deleteIndexedDB(key, finalConfig);
    }
  }

  // IndexedDB 专用的异步删除方法
  private async deleteIndexedDB(
    key: string, 
    config: CacheConfig
  ): Promise<void> {
    await this.ensureIndexedDBInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction([config.storeName!], 'readwrite');
      const store = transaction.objectStore(config.storeName!);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 清空缓存
  clear(config: CacheConfig = {}): Promise<void> | void {
    const finalConfig = { ...this.defaultConfig, ...config };

    switch (finalConfig.type) {
      case CacheType.MEMORY:
        this.memoryCache.clear();
        break;
      
      case CacheType.LOCAL_STORAGE:
        localStorage.clear();
        break;
      
      case CacheType.SESSION_STORAGE:
        sessionStorage.clear();
        break;
      
      case CacheType.INDEXED_DB:
        return this.clearIndexedDB(finalConfig);
    }
  }

  // IndexedDB 专用的异步清空方法
  private async clearIndexedDB(config: CacheConfig): Promise<void> {
    await this.ensureIndexedDBInitialized();
    
    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction([config.storeName!], 'readwrite');
      const store = transaction.objectStore(config.storeName!);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 检查缓存是否存在
  has(key: string, config: CacheConfig = {}): Promise<boolean> | boolean {
    const value = this.get(key, config);
    
    if (value instanceof Promise) {
      return value.then(v => v !== null);
    }
    
    return value !== null;
  }

  // 确保 IndexedDB 已初始化
  private async ensureIndexedDBInitialized(): Promise<void> {
    if (!this.indexedDB) {
      await this.initIndexedDB();
    }
  }

  // 验证缓存项是否有效
  private validateCacheItem<T>(cacheItem: CacheItem<T> | null): T | null {
    if (cacheItem && cacheItem.expires > Date.now()) {
      return cacheItem.value;
    }
    return null;
  }
}

export default new AdvancedCacheManager();