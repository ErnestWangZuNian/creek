import { ParamsType } from '@ant-design/pro-components';

import { useDebounceFn, useDeepCompareEffect } from 'ahooks';

import { useViewportHeight } from '../creek-hooks';
import { CreekTableProps } from './type';

export type CreekTableViewRender<T extends ParamsType, U extends ParamsType, ValueType = 'text'> = CreekTableProps<T, U, ValueType>['tableViewRender'];

// 独立的 TableViewWrapper 组件 - 包含所有表格视图相关逻辑
export const TableViewContent = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: CreekTableProps<T, U, ValueType>) => {
  const { prefixCls, pageFixedBottomConfig, pageFixedBottom, children } = props;

  const { containerRef, viewPortHeight } = useViewportHeight({
    isObserverParent: true,
  });

  // 设置antd内容区的高度，使得分页永远在底部
  const { run: setAntdTableContentHeight } = useDebounceFn(
    (mainHeight: number) => {
      const antdTableContentElement = containerRef.current?.querySelector(`.${prefixCls}-table`);
      const antdPaginationElement = containerRef.current?.querySelector(`.${prefixCls}-pagination`);
      if (antdTableContentElement) {
        const paginationHeight = antdPaginationElement?.clientHeight || 0;
        const bottomFix = pageFixedBottomConfig?.bottomFix || 20;
        const parentElement = containerRef.current?.parentElement;
        let parentPaddingBottom = 0;
        if (parentElement) {
          const style = window.getComputedStyle(parentElement);
          parentPaddingBottom = parseFloat(style.paddingBottom) || 0;
        }
        const tableContentHeight = mainHeight - paginationHeight - parentPaddingBottom - bottomFix - parentPaddingBottom;
        antdTableContentElement.setAttribute('style', `height: ${tableContentHeight}px`);
      }
    },
    {
      wait: 16,
    },
  );

  useDeepCompareEffect(() => {
    if (pageFixedBottom) {
      setAntdTableContentHeight(viewPortHeight ?? 0);
    }
  }, [viewPortHeight, pageFixedBottom, setAntdTableContentHeight]);

  // 默认渲染逻辑
  return (
    <>
      <div ref={containerRef}>{children}</div>
    </>
  );
};
