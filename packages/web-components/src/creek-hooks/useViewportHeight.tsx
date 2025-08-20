import { useDebounceEffect, useDeepCompareEffect, useEventListener, useMemoizedFn, useMount, useUnmount } from 'ahooks';
import { useRef, useState } from 'react';

interface UseViewportHeightOptions {
  /** 底部保留空间（如固定在底部的元素高度），默认 0 */
  bottomOffset?: number;
  /** 顶部保留空间，默认自动计算到容器顶部的距离 */
  topOffset?: number;
  /** 额外的边距，默认 0 */
  margin?: number;
  /** 最小高度，默认 0 */
  minHeight?: number;
  /** 最大高度，不设置则无限制 */
  maxHeight?: number;
  /** 是否启用调试模式，会在控制台输出计算信息 */
  debug?: boolean;
  /** 防抖延迟时间（毫秒），默认 16ms */
  debounceDelay?: number;
  /** 依赖项数组，当这些值变化时会重新计算高度（比如搜索条件） */
  deps?: React.DependencyList;

  isObserverParent?: boolean;
}

export const useViewportHeight = (options: UseViewportHeightOptions = {}) => {
  const { bottomOffset = 0, topOffset, margin = 0, minHeight = 0, maxHeight, debug = false, debounceDelay = 16, deps = [], isObserverParent } = options;

  const [viewPortHeight, setHeight] = useState<number | undefined>(undefined);
  let containerRef = useRef<HTMLDivElement| null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  // 使用 useMemoizedFn 缓存计算函数，避免不必要的重新创建
  const calculateHeight = useMemoizedFn(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // 计算顶部偏移量
    const calculatedTopOffset = topOffset ?? rect.top;

    // 计算可用高度
    const viewportHeight = window.innerHeight;
    let availableHeight = viewportHeight - calculatedTopOffset - bottomOffset - margin;

    // 应用最小/最大高度限制
    if (minHeight > 0) {
      availableHeight = Math.max(availableHeight, minHeight);
    }

    if (maxHeight && maxHeight > 0) {
      availableHeight = Math.min(availableHeight, maxHeight);
    }

    if (debug) {
      console.log('计算可视区域高度:', {
        viewportHeight,
        calculatedTopOffset,
        bottomOffset,
        margin,
        minHeight,
        maxHeight,
        availableHeight,
        containerRect: rect,
      });
    }

    setHeight(availableHeight);
  });

  // 使用 ahooks 的 useEventListener 监听窗口 resize 事件
  useEventListener('resize', calculateHeight, { target: () => window });

  // 使用 useDebounceEffect 处理依赖项变化时的防抖计算
  useDebounceEffect(
    () => {
      if (containerRef.current) {
        calculateHeight();
      }
    },
    [...deps, topOffset, bottomOffset, margin, minHeight, maxHeight],
    { wait: debounceDelay },
  );

  // 初始化计算
  useMount(() => {
    calculateHeight();
  });

  // 设置观察器
  const setupObservers = useMemoizedFn(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const observerParent = isObserverParent ? container.parentElement : container;

    if(!observerParent) return;

    cleanupObservers();

    resizeObserverRef.current = new ResizeObserver(() => {
      calculateHeight();
    });
    
    resizeObserverRef.current.observe(container);

    mutationObserverRef.current = new MutationObserver(() => {
      setTimeout(calculateHeight, 0);
    });

    mutationObserverRef.current.observe(observerParent, {
      childList: true,
      subtree: false, // 只监听直接子节点变化
      attributes: false,
    });
  });

  // 清理观察器
  const cleanupObservers = useMemoizedFn(() => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
      mutationObserverRef.current = null;
    }
  });


  // 组件卸载时清理
  useUnmount(() => {
    cleanupObservers();
  });

  useDeepCompareEffect(() => {
    if(containerRef.current) {
      setupObservers();
    }
  }, [containerRef.current])

  return {
    /** 容器引用，需要绑定到目标元素的容器 */
    containerRef,
    /** 计算得出的可视区域高度 */
    viewPortHeight,
    /** 手动重新计算高度的方法 */
    recalculate: calculateHeight,
    /** 是否已完成高度计算 */
    isCalculated: viewPortHeight !== undefined,
  };
};
