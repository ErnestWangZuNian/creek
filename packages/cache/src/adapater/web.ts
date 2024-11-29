import { LRUCache } from 'lru-cache';

// 获取 Options 的类型
type LRUOptions = ConstructorParameters<typeof LRUCache>[0];

// 缓存类型枚举
enum CacheType {
    MEMORY = 'memory',
    LOCAL_STORAGE = 'localStorage',
    SESSION_STORAGE = 'sessionStorage',
    INDEXED_DB = 'indexedDB'
}

export type CacheConfig = LRUOptions & {
    type?: CacheType;
    dbName?: string;
    storeName?: string;
};

// 缓存项结构
interface CacheItem<T> {
    value: T;
    expires: number;
}

class CreekWebCacheManager {
    private memoryCache: LRUCache<{}, {}>; // 使用泛型来指定键和值的类型
    private indexedDB: IDBDatabase | null = null;

    private defaultConfig: CacheConfig = {
        type: CacheType.MEMORY,
        max: 100,
        ttl: 1000 * 60 * 5, // 5 分钟
        dbName: 'CRREK_CACHE',
        storeName: 'CRREK_CACHE_STORE'
    };

    constructor() {
        this.memoryCache = new LRUCache(this.defaultConfig);
        this.initIndexedDB();
    }

    private async initIndexedDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const { dbName, storeName } = this.defaultConfig;

            if (dbName && storeName) {
                const request = indexedDB.open(dbName, 1);

                request.onupgradeneeded = (event) => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName);
                    }
                };

                request.onsuccess = () => {
                    this.indexedDB = request.result;
                    resolve(this.indexedDB);
                };

                request.onerror = () => reject(request.error);
            }
        });
    }

    // 设置缓存
    set<T>(key: string, value: T, config: CacheConfig): Promise<void> | void {
        const finalConfig = { ...this.defaultConfig, ...config };
        const cacheItem: CacheItem<T> = {
            value,
            expires: Date.now() + (finalConfig.ttl || 0),
        };

        switch (finalConfig.type) {
            case CacheType.MEMORY:
                this.memoryCache.set(key, cacheItem as CacheItem<unknown>, {
                    ttl: finalConfig.ttl,
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
        config: CacheConfig
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
    get<T>(key: string, config: CacheConfig): Promise<T | null> | T | null {
        const finalConfig = { ...this.defaultConfig, ...config };

        switch (finalConfig.type) {
            case CacheType.MEMORY:
                return (this.memoryCache.get(key) as CacheItem<T> | undefined)?.value ?? null;

            case CacheType.LOCAL_STORAGE:
                const localStorageItem = localStorage.getItem(key);
                return localStorageItem ? (JSON.parse(localStorageItem) as CacheItem<T>).value : null;

            case CacheType.SESSION_STORAGE:
                const sessionStorageItem = sessionStorage.getItem(key);
                return sessionStorageItem ? (JSON.parse(sessionStorageItem) as CacheItem<T>).value : null;

            case CacheType.INDEXED_DB:
                return this.getIndexedDB<T>(key, finalConfig);

            default:
                return (this.memoryCache.get(key) as CacheItem<T> | undefined)?.value ?? null;
        }
    }

    // IndexedDB 专用的异步获取方法
    private async getIndexedDB<T>(
        key: string,
        config: CacheConfig
    ): Promise<T | null> {
        await this.ensureIndexedDBInitialized();

        return new Promise<T | null>((resolve, reject) => {
            const transaction = this.indexedDB!.transaction([config.storeName!], 'readonly');
            const store = transaction.objectStore(config.storeName!);
            const request = store.get(key);

            request.onsuccess = () => resolve(this.validateCacheItem<T>(request.result));
            request.onerror = () => reject(request.error);
        });
    }

    // 删除缓存
    delete(key: string, config: CacheConfig): Promise<void> | void {
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

        return new Promise<void>((resolve, reject) => {
            const transaction = this.indexedDB!.transaction([config.storeName!], 'readwrite');
            const store = transaction.objectStore(config.storeName!);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // 清空缓存
    clear(config: CacheConfig): Promise<void> | void {
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

        return new Promise<void>((resolve, reject) => {
            const transaction = this.indexedDB!.transaction([config.storeName!], 'readwrite');
            const store = transaction.objectStore(config.storeName!);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // 检查缓存是否存在
    has(key: string, config: CacheConfig): Promise<boolean> | boolean {
        const value = this.get<unknown>(key, config); // 使用未知类型来检查存在性

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

export default CreekWebCacheManager;