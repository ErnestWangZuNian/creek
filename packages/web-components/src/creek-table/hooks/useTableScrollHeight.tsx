import { useDebounceFn, useEventListener } from 'ahooks';
import { useEffect, useState } from 'react';

export const useTableScrollHeight = (prefixCls: string, tableRef: React.RefObject<HTMLDivElement>, pageFixedBottom: boolean = true, offsetBottom: number = 0) => {
  const [scrollY, setScrollY] = useState<number | undefined>(undefined);
  const [tableHeight, setTableHeight] = useState<number | undefined>(undefined);

  const { run: calcHeight } = useDebounceFn(
    () => {
      if (!pageFixedBottom || !tableRef.current) return;

      const tableEl = tableRef.current;

      // 如果元素不可见（例如在 display: none 的 tab 中），不进行计算，防止计算出错误的高度
      if (tableEl.offsetParent === null) return;

      const tableHeader = tableEl.querySelector(`.${prefixCls}-table-thead`);
      const tableBody = tableEl.querySelector(`.${prefixCls}-table-body`);

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
      let currentTableHeight = windowHeight - tableEl.getBoundingClientRect().top;

      const pagination = tableEl.querySelector(`.${prefixCls}-pagination`);

      if (pagination) {
        const paginationHeight = pagination.clientHeight;

        const styles = window.getComputedStyle(pagination);
        const totalPaginationMargin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);

        height = height - paginationHeight - totalPaginationMargin;
        setTableHeight(0);
      } else {
        // 如果没有找到分页，预留一个高度（假设分页高度为 24px + margin 16px = 40px）
        // 这样可以避免初始加载时高度过大，导致出现滚动条，然后分页出现后高度又变小
        height = height - 40;

        setTableHeight(currentTableHeight);
      }

      // Minimum height to avoid crashes or ugly rendering
      setScrollY(height);
    },
    { wait: 100 },
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

  return {
    scrollY,
    tableHeight
  };
};
