import { ParamsType, ProTable } from '@ant-design/pro-components';
import _ from 'lodash';
import { useMemo } from 'react';

import { CreekFilterDisplay } from 'dist';
import { CreekSearchInput, useSearchContext } from '../creek-search';
import { TableViewContent } from './TableViewContent';
import { CreekTableProps } from './type';

// 独立的 ProTable 组件
export const SearchProTable = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: CreekTableProps<T, U, ValueType>) => {
  const { columns, params, prefixCls = 'ant', tableViewRender, pageFixedBottom, pageFixedBottomConfig, ...restProps } = props;

  const { filters, filtersToParams } = useSearchContext();

  // 获取搜素的参数
  const finalParams = useMemo(() => {
    let result = filtersToParams(filters) as U;
    return result;
  }, [filters]);

  return (
    <ProTable<T, U, ValueType>
      {...restProps}
      columns={columns}
      params={{
        ...params,
        ...finalParams,
      }}
      search={false}
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
