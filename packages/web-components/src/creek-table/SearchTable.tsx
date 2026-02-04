import { ParamsType, ProTable } from '@ant-design/pro-components';
import { createStyles } from 'antd-style';
import classnames from 'classnames';
import _ from 'lodash';
import { useRef } from 'react';

import { useAutoWidthColumns, useTableScrollHeight } from './hooks';
import { TableOptionRender } from './TableOptionRender';
import { toolBarRender } from './toolBarRender';
import { CreekTableProps } from './type';

const useStyles = createStyles(({ prefixCls }) => {
  return {
    'creek-table-container': {
      [`.${prefixCls}-table-body`]: {
        minHeight: 'var(--table-scroll-y)',
      },
      [`.${prefixCls}-pagination`]: {
        [`.${prefixCls}-pagination-total-text`]: {
          flex: `1`,
        },
      },
    },
  };
});

// 独立的 ProTable 组件
export const SearchProTable = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: CreekTableProps<T, U, ValueType>) => {
  const { columns, prefixCls = 'ant', autoAddFilterForColumn = true, className, optionsRender, tableViewRender, pagination, pageFixedBottom = true, pageFixedBottomConfig, ...restProps } = props;

  const proTableRef = useRef<HTMLDivElement>(null);

  // // 使用自定义 hook 处理工具栏的自适应功能
  // const { shouldCollapse } = useAdaptiveToolBar({
  //   containerRef: proTableRef,
  //   prefixCls,
  // });

  const { columns: adaptiveColumns, totalWidth } = useAutoWidthColumns(columns, proTableRef);

  const scrollY = useTableScrollHeight(prefixCls, proTableRef, pageFixedBottom);

  console.log('scrollY', scrollY);

  const { styles } = useStyles();

  return (
    <div ref={proTableRef}>
      <ProTable<T, U, ValueType>
        {...props}
        className={classnames(styles['creek-table-container'], className)}
        columns={adaptiveColumns}
        scroll={{
          x: totalWidth,
          ...restProps.scroll,
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
        // 在表格内容区上方显示筛选条件
        tableViewRender={(defaultProps, defaultDom) => {
          return _.isFunction(tableViewRender) ? <>{tableViewRender(defaultProps, defaultDom)}</> : defaultDom;
        }}
      />
    </div>
  );
};
