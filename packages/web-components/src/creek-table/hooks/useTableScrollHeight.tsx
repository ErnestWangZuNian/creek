import { useDebounceFn, useEventListener } from 'ahooks';
import { useEffect, useState } from 'react';

/**
 * 获取最近的可滚动父容器
 */
const getScrollParent = (element: HTMLElement): HTMLElement | Window => {
  let parent: HTMLElement | null = element.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
};

export const useTableScrollHeight = (prefixCls: string, tableRef: React.RefObject<HTMLDivElement>, pageFixedBottom: boolean = true, offsetBottom: number = 0) => {
  const [scrollY, setScrollY] = useState<number | undefined>(undefined);
  const [tableHeight, setTableHeight] = useState<number | undefined>(undefined);
  const [tableContainerHeight, setTableContainerHeight] = useState<number | undefined>(0);
  const [hasScroll, setHasScroll] = useState<boolean>(false);

  const { run: calcHeight } = useDebounceFn(
    () => {
      if (!pageFixedBottom || !tableRef.current) return;

      const tableEl = tableRef.current;

      // 如果元素不可见（例如在 display: none 的 tab 中），不进行计算，防止计算出错误的高度
      if (tableEl.offsetParent === null) return;

      const tableHeader = tableEl.querySelector(`.${prefixCls}-table-thead`);
      const tableBody = tableEl.querySelector(`.${prefixCls}-table-tbody`);

      // 尝试动态获取 layout content padding
      // Ant Design Pro Layout 的 content 容器通常有 class 包含 'pro-layout-content'
      // 例如：ant-pro-layout-content, my-prefix-pro-layout-content
      let currentContentPadding = 0; // 默认使用传入的

      const layoutContentEl = tableEl.closest(`div[class*="pro-layout-content"]`);
      if (layoutContentEl) {
        const style = window.getComputedStyle(layoutContentEl);
        // 我们主要关心底部的 padding，因为它影响到底部留白
        const paddingBottom = parseFloat(style.paddingBottom);
        if (!isNaN(paddingBottom)) {
          currentContentPadding = paddingBottom;
        }
      }

      // 尝试动态获取 layout content padding
      // Ant Design Pro Layout 的 content 容器通常有 class 包含 'pro-layout-content'
      // 例如：ant-pro-layout-content, my-prefix-pro-layout-content
      let currentCardContentPadding = 0; // 默认使用传入的

      const cardContentEl = tableEl.querySelector(`.${prefixCls}-pro-card-body`);
      if (cardContentEl) {
        const style = window.getComputedStyle(cardContentEl);
        // 我们主要关心底部的 padding，因为它影响到底部留白
        const paddingBottom = parseFloat(style.paddingBottom);
        if (!isNaN(paddingBottom)) {
          currentCardContentPadding = paddingBottom;
        }
      }

      let top = 0;
      if (tableHeader) {
        top = tableHeader.getBoundingClientRect().bottom;
      } else if (tableBody) {
        top = tableBody.getBoundingClientRect().top;
      }

      const windowHeight = window.innerHeight;

      let height = windowHeight - top - currentContentPadding - currentCardContentPadding - offsetBottom;

      // 计算表格容器高度：相对于滚动父容器的位置，而非视口位置
      // 这样即使表格上方有其他内容，高度计算也不会受页面滚动影响
      const scrollParent = getScrollParent(tableEl);
      let parentTop = 0;
      if (scrollParent instanceof HTMLElement) {
        parentTop = scrollParent.getBoundingClientRect().top;
      }
      const tableTopRelativeToParent = tableEl.getBoundingClientRect().top - parentTop;
      let currentTableHeight = windowHeight - tableTopRelativeToParent - offsetBottom;

      const pagination = tableEl.querySelector(`.${prefixCls}-pagination`);

      if (pagination) {
        const paginationHeight = pagination.clientHeight;

        const styles = window.getComputedStyle(pagination);
        const totalPaginationMargin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);

        height = height - paginationHeight - totalPaginationMargin;
        currentTableHeight = currentTableHeight - paginationHeight - totalPaginationMargin;
        setTableHeight(0);
      } else {
        // 如果没有找到分页，预留一个高度（假设分页高度为 24px + margin 16px = 40px）
        // 这样可以避免初始加载时高度过大，导致出现滚动条，然后分页出现后高度又变小
        height = height - 40;
        currentTableHeight = currentTableHeight - 40;

        setTableHeight(currentTableHeight);
      }

      let currentHasScroll = false;
      if (tableBody) {
        currentHasScroll = tableBody.scrollHeight > height;
      }
      setHasScroll(currentHasScroll);

      // Minimum height to avoid crashes or ugly rendering
      setScrollY(height);

      if (tableHeader) {
        setTableContainerHeight(height + tableHeader?.clientHeight);
      }
    },
    { wait: 16,leading: true },
  );

  useEffect(() => {
    // Initial calculation
    calcHeight();

    // Observer for DOM changes that might affect position
    const observer = new MutationObserver(calcHeight);
    if (tableRef.current) {
      observer.observe(tableRef.current, { childList: true, subtree: true });
    }
    return () => observer.disconnect();
  }, [tableRef, pageFixedBottom, prefixCls]);

  useEventListener('resize', calcHeight);
  // 监听滚动事件，确保页面滚动时也能正确计算高度
  useEventListener('scroll', calcHeight, { target: window });

  return {
    scrollY,
    tableHeight,
    tableContainerHeight,
    hasScroll,
  };
};
