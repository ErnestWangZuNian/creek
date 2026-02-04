import { useDebounceFn, useEventListener } from 'ahooks';
import { useEffect, useState } from 'react';

export const useTableScrollHeight = (prefixCls: string, tableRef: React.RefObject<HTMLDivElement>, pageFixedBottom: boolean = true, contentPadding: number = 16, offsetBottom: number = 16) => {
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
  
      let height = windowHeight - top -  contentPadding - offsetBottom;

      const pagination = tableEl.querySelector(`.${prefixCls}-pagination`);

      if (pagination) {
        const paginationHeight = pagination.clientHeight;

        const styles = window.getComputedStyle(pagination);
        const totalPaginationMargin = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);

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
