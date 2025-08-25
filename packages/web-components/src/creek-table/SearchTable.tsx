import { ParamsType, ProTable } from '@ant-design/pro-components';
import { createStyles } from 'antd-style';
import classnames from 'classnames';
import _ from 'lodash';
import { useMemo } from 'react';

import { CreekFilterDisplay, CreekSearchInput, useSearchContext } from '../creek-search';

import { useAutoAddFilterToColumns } from './hooks';
import { TableOptionRender } from './TableOptionRender';
import { TableViewContent } from './TableViewContent';
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

  const searchContext = useSearchContext();
  const { filters, filtersToParams } = searchContext;

  // 使用自定义 hook 处理列的筛选功能（包含状态管理）
  const { columnsWithFilter } = useAutoAddFilterToColumns({
    columns,
    autoAddFilterForColumn,
  });

  const { styles } = useStyles();

  // 获取搜素的参数
  const finalParams = useMemo(() => {
    let result = filtersToParams(filters) as U;
    return result;
  }, [filters]);

  return (
    <ProTable<T, U, ValueType>
      {...restProps}
      className={classnames(styles['creek-table-container'], className)}
      columns={columnsWithFilter}
      params={{
        ...params,
        ...finalParams,
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
      // 在 headerTitle 中只放搜索输入框
      headerTitle={<CreekSearchInput />}
      // 在表格内容区上方显示筛选条件
      tableViewRender={(defaultProps, defaultDom) => {
        return _.isFunction(tableViewRender) ? (
          <>
            <CreekFilterDisplay />
            {tableViewRender(defaultProps, defaultDom)}
          </>
        ) : (
          <TableViewContent<T, U, ValueType> pageFixedBottom={pageFixedBottom} pageFixedBottomConfig={pageFixedBottomConfig} prefixCls={prefixCls}>
            {defaultDom}
          </TableViewContent>
        );
      }}
    />
  );
};
