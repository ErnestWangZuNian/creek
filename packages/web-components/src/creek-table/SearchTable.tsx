import { ParamsType, ProTable } from '@ant-design/pro-components';
import { createStyles } from 'antd-style';
import classnames from 'classnames';
import _ from 'lodash';
import { useRef } from 'react';

import { useAdaptiveToolBar } from './hooks';
import { TableOptionRender } from './TableOptionRender';
import { TableViewContent } from './TableViewContent';
import { toolBarRender } from './toolBarRender';
import { CreekTableProps } from './type';

const useStyles = createStyles(({ prefixCls }) => {
  return {
    'creek-table-container': {
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
  const {
    columns,
    params,
    prefixCls = 'ant',
    autoAddFilterForColumn = true,
    className,
    optionsRender,
    tableViewRender,
    pagination,
    pageFixedBottom = true,
    pageFixedBottomConfig,
    ...restProps
  } = props;

  const proTableRef = useRef(null);

  // 使用自定义 hook 处理工具栏的自适应功能
  const { shouldCollapse } = useAdaptiveToolBar({
    containerRef: proTableRef,
    prefixCls,
  });

  const { styles } = useStyles();

  return (
    <div ref={proTableRef}>
      <ProTable<T, U, ValueType>
        {...restProps}
        className={classnames(styles['creek-table-container'], className)}
        columns={columns}
        toolbar={{
          ...restProps.toolbar,
        }}
        search={false}
        pagination={{
          showTotal: (total) => <span>共 {total} 条</span>,
          showSizeChanger: true,
          ...pagination,
        }}
        optionsRender={(defaultProps, dom) => {
          return _.isFunction(optionsRender)
            ? optionsRender(defaultProps, dom)
            : restProps?.options
              ? [<TableOptionRender key="option" defaultDom={dom} importConfig={restProps?.options?.importConfig} exportConfig={restProps?.options?.exportConfig} />]
              : [];
        }}
        toolBarRender={() => {
          return toolBarRender({ shouldCollapse, restProps });
        }}
        // 在表格内容区上方显示筛选条件
        tableViewRender={(defaultProps, defaultDom) => {
          return _.isFunction(tableViewRender) ? (
            <>{tableViewRender(defaultProps, defaultDom)}</>
          ) : (
            <TableViewContent<T, U, ValueType> pageFixedBottom={pageFixedBottom} pageFixedBottomConfig={pageFixedBottomConfig} prefixCls={prefixCls}>
              {defaultDom}
            </TableViewContent>
          );
        }}
      />
    </div>
  );
};
