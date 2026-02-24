import { ParamsType, ProTable } from '@ant-design/pro-components';
import { createStyles } from 'antd-style';
import classnames from 'classnames';
import _ from 'lodash';
import { useRef } from 'react';

import { GlobalScrollbarStyle } from '../creek-style';
import { useAutoWidthColumns, useTableScrollHeight } from './hooks';
import { TableOptionRender } from './TableOptionRender';
import { toolBarRender } from './toolBarRender';
import { CreekTableProps } from './type';

export type SearchTableStyleOptions = {
  prefixCls?: string;
  scrollY?: number;
};

const useStyles = createStyles(({ token }, options: SearchTableStyleOptions) => {
  const { prefixCls = 'ant', scrollY } = options;
  return {
    'creek-table-container': {
      overflow: 'hidden',
      [`.${prefixCls}-table-body`]: {
        overflowY: 'auto',
        minHeight: `${scrollY}px`,
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
  const { columns, prefixCls = 'ant', autoAddFilterForColumn = true, className, optionsRender, tableViewRender, pagination, pageFixedBottom = true,  pageFixedBottomConfig, ...restProps } = props;

  const proTableRef = useRef<HTMLDivElement>(null);

  const { columns: adaptiveColumns, totalWidth } = useAutoWidthColumns(columns, proTableRef);

  const scrollY = useTableScrollHeight(prefixCls, proTableRef, pageFixedBottom, pageFixedBottomConfig?.bottomFix );

  const { styles } = useStyles({ scrollY, prefixCls });

  return (
    <div ref={proTableRef}>
      <GlobalScrollbarStyle />
      <ProTable<T, U, ValueType>
        {...props}
        className={classnames(styles['creek-table-container'], className)}
        columns={adaptiveColumns}
        scroll={{
          x: totalWidth,
          y: scrollY ?? restProps.scroll?.y,
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
