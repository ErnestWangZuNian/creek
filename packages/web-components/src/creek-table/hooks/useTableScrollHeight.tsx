import { useDebounceFn, useEventListener } from 'ahooks';
import { useEffect, useState } from 'react';

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

      let top = 0;
      if (tableHeader) {
        top = tableHeader.getBoundingClientRect().bottom;
      } else if (tableBody) {
        top = tableBody.getBoundingClientRect().top;
      }

      const windowHeight = window.innerHeight;

      // 策略：以 window.innerHeight 为基准，向上遍历所有祖先扣除 paddingBottom
      // 这样不依赖任何容器的固定高度（因为布局内容 height 可能是 auto，会随内容变化）
      // 避免循环依赖：表格高度依赖容器底部 → 容器高度依赖表格高度
      let availableBottom = windowHeight;
      let el: HTMLElement | null = tableEl.parentElement;
      while (el) {
        const style = window.getComputedStyle(el);
        const paddingBottom = parseFloat(style.paddingBottom) || 0;
        availableBottom -= paddingBottom;
        if (el.tagName === 'BODY') break;
        el = el.parentElement;
      }

      availableBottom -= offsetBottom;

      // 扣除 tableEl 内部容器的 paddingBottom（如 ant-pro-card-body）
      // 这些容器包裹着 thead/tbody/pagination，其 padding 会让 tableEl 实际高度超出计算值
      // 从 pagination（或 tbody）向上遍历到 tableEl，扣除路径上所有容器的 paddingBottom
      const bottomRef = tableEl.querySelector(`.${prefixCls}-pagination`) || tableBody;
      if (bottomRef) {
        let innerEl: HTMLElement | null = bottomRef.parentElement;
        while (innerEl && innerEl !== tableEl) {
          const innerStyle = window.getComputedStyle(innerEl);
          availableBottom -= parseFloat(innerStyle.paddingBottom) || 0;
          innerEl = innerEl.parentElement;
        }
      }

      // 确保不小于 top，防止负值
      if (availableBottom < top) availableBottom = top;

      // 核心公式：
      // availableBottom - thead.bottom = thead 底部到可用区域底部的距离
      // thead.bottom 是视口绝对坐标，天然包含了上方所有元素
      // （tabs 导航栏、搜索区域、统计卡片、header 等）的高度
      let height = availableBottom - top;

      // 计算表格容器高度（用于分页未出现时撑开容器，防止初始加载出现滚动条）
      const tableTop = tableEl.getBoundingClientRect().top;
      let currentTableHeight = availableBottom - tableTop;

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

      // 确保 height 不为负
      if (height < 0) height = 0;

      let currentHasScroll = false;
      if (tableBody) {
        currentHasScroll = tableBody.scrollHeight > height;
      }
      setHasScroll(currentHasScroll);

      setScrollY(height);

      if (tableHeader) {
        setTableContainerHeight(height + tableHeader?.clientHeight);
      }
    },
    { wait: 16, leading: true },
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
    tableHeight,
    tableContainerHeight,
    hasScroll,
  };
};
