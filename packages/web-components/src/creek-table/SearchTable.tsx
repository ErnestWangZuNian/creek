import { ParamsType, ProTable } from '@ant-design/pro-components';
import { useSafeState } from 'ahooks';
import { createStyles } from 'antd-style';
import classnames from 'classnames';
import { useRef } from 'react';

import { GlobalScrollbarStyle } from '../creek-style';
import { useAutoWidthColumns, useEllipsisColumns, useIndexColumn, useResizableColumns, useTableOptions, useTableScrollHeight } from './hooks';

import { CreekTableProps } from './type';

export type SearchTableStyleOptions = {
  prefixCls?: string;
  scrollY?: number;
  tableContainerHeight?: number;
  tableHeight?: number;
  bordered?: boolean;
  hasHeaderTitle?: boolean;
  hasScroll?: boolean;
};

const useStyles = createStyles(({ token }, options: SearchTableStyleOptions) => {
  const { prefixCls = 'ant', scrollY, tableHeight, bordered, hasHeaderTitle, tableContainerHeight, hasScroll } = options;
  return {
    'creek-table-container': {
      overflow: 'hidden',
      position: 'relative',
      height: tableHeight ? `${tableHeight}px` : 'auto',
      backgroundColor: token.colorBgContainer,
      [`.${prefixCls}-table`]: {
        minHeight: `${tableContainerHeight}px`,
      },
      [`.${prefixCls}-table-container`]: {
        borderBottom: 'none',
        overflow: 'hidden'
      },
     
      [`.${prefixCls}-table-header`]: {
        borderRight: (bordered && hasScroll) ? `1px solid ${token.colorBorderSecondary}` : 'none',
      },
      [`.${prefixCls}-table-body`]: {
        overflowY: 'auto',
        maxHeight: `${scrollY}px`,
        borderRight: (bordered && hasScroll) ? `1px solid ${token.colorBorderSecondary}` : 'none',
      },
      // 兼容非 scroll.y 模式下的 table 容器
      [`.${prefixCls}-table-content`]: {
        overflowY: 'hidden',
        maxHeight: scrollY ? `${scrollY}px` : undefined,
      },

      [`.${prefixCls}-table-cell-scrollbar`]: {
        boxShadow: bordered ? 'none!important' : 'inherit',
        borderInlineEnd: bordered ? `none!important` : 'none',
        display: hasScroll ? 'table-cell' : 'none',
        width: hasScroll ? 'initial' : '0px!important',
        minWidth: hasScroll ? 'initial' : '0px!important',
        maxWidth: hasScroll ? 'initial' : '0px!important',
        padding: hasScroll ? 'initial' : '0px!important',
        margin: hasScroll ? 'initial' : '0px!important',
      },

      [`.${prefixCls}-pagination`]: {
        [`.${prefixCls}-pagination-total-text`]: {
          flex: 1,
        },
      },
      [`.${prefixCls}-pro-table-search`]: {
        marginBlockEnd: 0,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      },

      [`.${prefixCls}-pro-query-filter-container`]: {
        [`.${prefixCls}-pro-query-filter`]: {
          padding: token.paddingXS,
        },
      },

      // 如果没有 headerTitle，toolbar 展示在 headerTitle 的区域
      [`.${prefixCls}-pro-table-list-toolbar-right`]: !hasHeaderTitle
        ? {
            flex: 1,
          }
        : {},
      [`.${prefixCls}-pro-table-list-toolbar-setting-items`]: !hasHeaderTitle
        ? {
            marginLeft: 'auto',
          }
        : {},
    },
  };
});

// 独立的 ProTable 组件
export const SearchProTable = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: CreekTableProps<T, U, ValueType>) => {
  const {
    columns,
    prefixCls = 'ant',
    autoAddFilterForColumn = true,
    className,
    optionsRender,
    tableViewRender,
    pagination,
    pageFixedBottom = true,
    pageFixedBottomConfig,
    resizable = true,
    bordered = true,
    options,
    size,
    headerTitle,
    showIndex = true,
    ...restProps
  } = props;

  const proTableRef = useRef<HTMLDivElement>(null);

  // 状态提升：管理列宽调整状态，以便 useAutoWidthColumns 能感知到
  const [resizedWidths, setResizedWidths] = useSafeState<Record<string, number>>({});

  // 使用自定义 Hook 管理 options 和 size
  const { finalOptions, tableSize, finalOptionsRender } = useTableOptions<T, U, ValueType>(options, size, optionsRender);

  const columnsWithIndex = useIndexColumn<T, ValueType>(columns, showIndex);

  // 处理 columns，默认开启 ellipsis
  const processedColumns = useEllipsisColumns(columnsWithIndex);

  const { columns: adaptiveColumns, totalWidth } = useAutoWidthColumns<T, ValueType>(processedColumns, proTableRef, resizedWidths, bordered, tableSize);

  const { columns: resizableColumns, components } = useResizableColumns<T, ValueType>(adaptiveColumns, resizable, resizedWidths, setResizedWidths, proTableRef);

  const { scrollY, tableHeight, tableContainerHeight, hasScroll } = useTableScrollHeight(prefixCls, proTableRef, pageFixedBottom, pageFixedBottomConfig?.bottomFix);

  const { styles } = useStyles({ scrollY, tableHeight, prefixCls, bordered, hasHeaderTitle: !!headerTitle, tableContainerHeight, hasScroll });


  return (
    <div ref={proTableRef}>
      <GlobalScrollbarStyle />
      {/* 自定义滚动条 */}
      <ProTable<T, U, ValueType>
        components={components}
        headerTitle={headerTitle}
        options={finalOptions}
        optionsRender={finalOptionsRender}
        size={tableSize}
        {...restProps}
        className={classnames(styles['creek-table-container'], className)}
        columns={resizableColumns}
        bordered={bordered}
        scroll={{
          y: hasScroll ? scrollY || restProps.scroll?.y : undefined,
          x: totalWidth ?? restProps.scroll?.x,
        }}
        toolbar={{
          ...restProps.toolbar,
        }}
      />
    </div>
  );
};
