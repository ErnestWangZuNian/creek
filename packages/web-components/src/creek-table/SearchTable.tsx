import { ParamsType, ProTable } from '@ant-design/pro-components';
import { useSafeState } from 'ahooks';
import { createStyles } from 'antd-style';
import classnames from 'classnames';
import _ from 'lodash';
import { useRef } from 'react';

import { GlobalScrollbarStyle } from '../creek-style';
import { useAutoWidthColumns, useResizableColumns, useTableScrollHeight } from './hooks';
import { TableOptionRender } from './TableOptionRender';
import { toolBarRender } from './toolBarRender';
import { CreekTableProps } from './type';

export type SearchTableStyleOptions = {
  prefixCls?: string;
  scrollY?: number;
  bordered?: boolean;
};

const useStyles = createStyles(({ token }, options: SearchTableStyleOptions) => {
  const { prefixCls = 'ant', scrollY, bordered } = options;
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
    ...restProps
  } = props;

  const proTableRef = useRef<HTMLDivElement>(null);

  // 状态提升：管理列宽调整状态，以便 useAutoWidthColumns 能感知到
  const [resizedWidths, setResizedWidths] = useSafeState<Record<string, number>>({});


  const { columns: adaptiveColumns, totalWidth } = useAutoWidthColumns<T, ValueType>(columns, proTableRef, resizedWidths, bordered);

  const { columns: resizableColumns, components } = useResizableColumns<T, ValueType>(adaptiveColumns, resizable, resizedWidths, setResizedWidths, proTableRef);

  const scrollY = useTableScrollHeight(prefixCls, proTableRef, pageFixedBottom, pageFixedBottomConfig?.bottomFix);

  const { styles } = useStyles({ scrollY, prefixCls,  bordered });

  return (
    <div ref={proTableRef}>
      <GlobalScrollbarStyle />
      {/* 自定义滚动条 */}
      <ProTable<T, U, ValueType>
        {...props}
        className={classnames(styles['creek-table-container'], className)}
        columns={resizableColumns}
        components={components}
        bordered={bordered}
        scroll={{
          y: scrollY ?? restProps.scroll?.y,
          x: totalWidth ?? restProps.scroll?.x,
        }}
        toolbar={{
          ...restProps.toolbar,
        }}
        optionsRender={(defaultProps, dom) => {
          return _.isFunction(optionsRender)
            ? optionsRender(defaultProps, dom)
            : restProps?.options
              ? [<TableOptionRender key="option" defaultDom={dom} importConfig={restProps?.options?.importConfig} exportConfig={restProps?.options?.exportConfig} />]
              : [];
        }}
        toolBarRender={(...args) => {
          return toolBarRender({ shouldCollapse: false, restProps, args });
        }}
      />
    </div>
  );
};
