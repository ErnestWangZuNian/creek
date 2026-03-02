import { ParamsType, ProTable } from '@ant-design/pro-components';
import { useSafeState } from 'ahooks';
import { createStyles } from 'antd-style';
import classnames from 'classnames';
import { useRef } from 'react';

import { GlobalScrollbarStyle } from '../creek-style';
import { useAutoWidthColumns, useEllipsisColumns, useResizableColumns, useTableOptions, useTableScrollHeight } from './hooks';

import { CreekTableProps } from './type';

export type SearchTableStyleOptions = {
  prefixCls?: string;
  scrollY?: number;
  bordered?: boolean;
  hasHeaderTitle?: boolean;
};

const useStyles = createStyles(({ token }, options: SearchTableStyleOptions) => {
  const { prefixCls = 'ant', scrollY, bordered, hasHeaderTitle } = options;
  return {
    'creek-table-container': {
      overflow: 'hidden',
      position: 'relative',
      [`.${prefixCls}-table-header`]: {
        borderRight: bordered ? `1px solid ${token.colorBorderSecondary}` : 'none',
      },
      [`.${prefixCls}-table-body`]: {
        overflowY: 'auto',
        minHeight: `${scrollY}px`,
        borderRight: bordered ? `1px solid ${token.colorBorderSecondary}` : 'none',
      },

      [`.${prefixCls}-table-cell-scrollbar`]: {
        boxShadow: bordered ? 'none!important' : 'inherit',
        borderInlineEnd: bordered ? `none!important` : 'none',
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
    ...restProps
  } = props;

  const proTableRef = useRef<HTMLDivElement>(null);

  // 状态提升：管理列宽调整状态，以便 useAutoWidthColumns 能感知到
  const [resizedWidths, setResizedWidths] = useSafeState<Record<string, number>>({});

  // 使用自定义 Hook 管理 options 和 size
  const { finalOptions, tableSize, finalOptionsRender } = useTableOptions<T, U, ValueType>(options, size, optionsRender);

  // 处理 columns，默认开启 ellipsis
  const processedColumns = useEllipsisColumns(columns);

  const { columns: adaptiveColumns, totalWidth } = useAutoWidthColumns<T, ValueType>(processedColumns, proTableRef, resizedWidths, bordered, tableSize);

  const { columns: resizableColumns, components } = useResizableColumns<T, ValueType>(adaptiveColumns, resizable, resizedWidths, setResizedWidths, proTableRef);

  const scrollY = useTableScrollHeight(prefixCls, proTableRef, pageFixedBottom, pageFixedBottomConfig?.bottomFix);

  const { styles } = useStyles({ scrollY, prefixCls, bordered, hasHeaderTitle: !!headerTitle });

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
          y: scrollY ?? restProps.scroll?.y,
          x: totalWidth ?? restProps.scroll?.x,
        }}
        toolbar={{
          ...restProps.toolbar,
        }}
      />
    </div>
  );
};
