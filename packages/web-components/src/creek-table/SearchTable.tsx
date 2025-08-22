import { ParamsType, ProTable } from '@ant-design/pro-components';
import { createStyles } from 'antd-style';
import classnames from 'classnames';
import _ from 'lodash';
import { useMemo } from 'react';

import { CreekFilterDisplay, CreekSearchInput, useSearchContext } from '../creek-search';
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
  const { columns, params, prefixCls = 'ant', className, tableViewRender, pagination, pageFixedBottom = true, pageFixedBottomConfig, ...restProps } = props;

  const { filters, filtersToParams } = useSearchContext();

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
      columns={columns}
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
