import axios from 'axios';
import { AxiosPlugin, AxiosPluginConfigType, AxiosPluginErrorType, AxiosPluginResponseType } from './AxiosPlugin';

export type DuplicatePluginConfigType = {
  closeDuplicate?: boolean;
  // 请求完成后的冷却时间，防止接口刚返回就立刻重发，默认 0（不冷却）
  cooldownInterval?: number;
  // 是否将重复请求的错误抛出给业务层，默认 false（即拦截后只打印警告，静默处理）
  throwDuplicateError?: boolean;
  // 用于内部存储生成的请求唯一标识
  __duplicateKey__?: string;
  // 内部标记：是否为重复请求
  __isDuplicate__?: boolean;
  // 内部标记：单次请求的唯一 ID
  __requestId__?: string;
};

// 防重复提交插件
export class DuplicatePlugin extends AxiosPlugin {
  // 请求"进行中"的锁：key 存在 = 该请求正在飞行，严格拦截。使用 Map 存储 __requestId__
  private inFlight: Map<string, string>;
  // 请求完成后的"冷却期"锁：允许重发
  private cooldown: Map<string, ReturnType<typeof setTimeout>>;
  private options: DuplicatePluginConfigType;

  constructor(options: DuplicatePluginConfigType = {}) {
    super();
    this.inFlight = new Map();
    this.cooldown = new Map();
    this.options = options;

    if (typeof window !== 'undefined') {
      // 路由变化时清理所有的锁，防止页面快速切换时，新页面的请求被上一个未完成的请求拦截
      const onRouteChange = () => this.clearAll();

      window.addEventListener('hashchange', onRouteChange);
      window.addEventListener('popstate', onRouteChange);

      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = function (...args) {
        originalPushState.apply(this, args);
        window.dispatchEvent(new Event('pushstate_changed'));
      };

      window.history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        window.dispatchEvent(new Event('replacestate_changed'));
      };

      window.addEventListener('pushstate_changed', onRouteChange);
      window.addEventListener('replacestate_changed', onRouteChange);
    }
  }

  beforeRequest(config: AxiosPluginConfigType<DuplicatePluginConfigType>) {
    const closeDuplicate = config.closeDuplicate ?? this.options.closeDuplicate ?? false;

    if (closeDuplicate) return config;

    const key = this.getRequestKey(config);

    // 规则1：请求仍在飞行中，直接拦截，不管时间
    if (this.inFlight.has(key)) {
      console.warn(`[DuplicatePlugin]: 请求重复了，已拦截: ${config.url}`);
      config.__isDuplicate__ = true;
      const cancelError = new axios.CanceledError('Duplicate request canceled');
      (cancelError as any).config = config;
      return Promise.reject(cancelError);
    }

    // 规则2：请求刚完成，还在冷却期内，拦截
    if (this.cooldown.has(key)) {
      console.warn(`[DuplicatePlugin]: 请求太频繁，还在冷却期内，已拦截: ${config.url}`);
      config.__isDuplicate__ = true;
      const cancelError = new axios.CanceledError('Duplicate request canceled');
      (cancelError as any).config = config;
      return Promise.reject(cancelError);
    }

    // 标记为"进行中"
    config.__requestId__ = Math.random().toString(36).substring(2);
    this.inFlight.set(key, config.__requestId__);
    config.__duplicateKey__ = key;

    return config;
  }

  afterRequest(response: AxiosPluginResponseType<DuplicatePluginConfigType>) {
    const closeDuplicate = response.config.closeDuplicate ?? this.options.closeDuplicate ?? false;

    if (closeDuplicate) return response;

    const key = response.config.__duplicateKey__ || this.getRequestKey(response.config);

    // 请求完成，释放飞行锁（仅当是当前最新的请求时才释放，防止路由切换后旧请求释放了新请求的锁）
    if (this.inFlight.get(key) === response.config.__requestId__) {
      this.inFlight.delete(key);
    }

    // 如果配置了冷却期，进入冷却
    const cooldownInterval = response.config.cooldownInterval ?? this.options.cooldownInterval ?? 0;
    if (cooldownInterval > 0) {
      // 清理可能已存在的旧 timer（理论上不会，但防御一下）
      this.clearCooldownKey(key);
      const timer = setTimeout(() => {
        this.cooldown.delete(key);
      }, cooldownInterval);
      this.cooldown.set(key, timer);
    }

    return response;
  }

  onError(error: AxiosPluginErrorType<DuplicatePluginConfigType>) {
    const errConfig = error.config || (error as any).config || {};

    // 是重复请求导致的取消
    if (errConfig?.__isDuplicate__) {
      const throwDuplicateError = errConfig.throwDuplicateError ?? this.options.throwDuplicateError ?? false;
      if (throwDuplicateError) {
        return Promise.reject(error);
      }
      // 默认静默处理：返回一个永远 pending 的 Promise，截断错误链，防止报错抛到业务层
      return new Promise<never>(() => {});
    }

    const closeDuplicate = errConfig.closeDuplicate ?? this.options.closeDuplicate ?? false;

    // 真实请求失败（网络错误、超时、业务错误等），释放飞行锁，让用户可以重试
    if (errConfig?.url && !closeDuplicate) {
      const key = errConfig.__duplicateKey__ || this.getRequestKey(errConfig);
      if (this.inFlight.get(key) === errConfig.__requestId__) {
        this.inFlight.delete(key);
      }
      // 失败不进入冷却期，立即可重试
      this.clearCooldownKey(key);
    }

    return Promise.reject(error);
  }

  /** 清理单个 key 的冷却期 timer */
  private clearCooldownKey(key: string) {
    const timer = this.cooldown.get(key);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.cooldown.delete(key);
    }
  }

  /** 清理所有冷却期锁 */
  public clearCooldown() {
    this.cooldown.forEach((timer) => clearTimeout(timer));
    this.cooldown.clear();
  }

  /** 完全重置 */
  public clearAll() {
    this.inFlight.clear();
    this.clearCooldown();
  }

  getRequestKey(config: AxiosPluginConfigType<DuplicatePluginConfigType>) {
    const { method, url, params, data } = config;
    return [ method, url, JSON.stringify(params), JSON.stringify(data)].join('&');
  }
}
