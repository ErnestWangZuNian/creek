import { useDebounceFn, useEventListener } from 'ahooks';
import { useEffect, useState } from 'react';

export const useTableScrollHeight = (prefixCls: string, tableRef: React.RefObject<HTMLDivElement>, pageFixedBottom: boolean = true, offsetBottom: number = 20) => {
  const [scrollY, setScrollY] = useState<number | undefined>(undefined);

  const { run: calcHeight } = useDebounceFn(
    () => {
      if (!pageFixedBottom || !tableRef.current) return;

      const tableEl = tableRef.current;

      const tableHeader = tableEl.querySelector(`.${prefixCls}-table-thead`);
      const tableBody = tableEl.querySelector(`.${prefixCls}-table-body`);

      let top = 0;
      if (tableHeader) {
        top = tableHeader.getBoundingClientRect().bottom;
      } else if (tableBody) {
        top = tableBody.getBoundingClientRect().top;
      }

      const windowHeight = window.innerHeight;

      const parentElement = tableRef.current?.parentElement;
      let parentPaddingBottom = 0;

      if (parentElement) {
        const style = window.getComputedStyle(parentElement);
        parentPaddingBottom = parseFloat(style.paddingBottom) || 0;
      }
      let height = windowHeight - top - 16 - offsetBottom;

      const pagination = tableEl.querySelector(`.${prefixCls}-pagination`);

      if (pagination) {
        const paginationHeight = pagination.clientHeight;

        const styles = window.getComputedStyle(pagination);
        // 总的垂直 margin
        const totalPaginationMargin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);

        console.log(paginationHeight, totalPaginationMargin, height, parentPaddingBottom, 'paginationHeight');
        height = height - paginationHeight - totalPaginationMargin;
      }

      // Minimum height to avoid crashes or ugly rendering
      setScrollY(Math.max(height, 200));
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

  return scrollY;
};
