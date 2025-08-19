import { ParamsType, ProTable } from '@ant-design/pro-components';
import { useMemo } from 'react';

import { CreekFilterDisplay, CreekSearchInput, useSearchContext } from '../creek-search';
import { CreekTableProps } from './type';

// 独立的 ProTable 组件
export const SearchProTable = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: CreekTableProps<T, U, ValueType>) => {
  const { columns, params, ...restProps } = props;
  const { filters, filtersToParams } = useSearchContext();

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
      tableViewRender={(_, dom) => (
        <>
          {/* 筛选条件展示区域 */}
          <CreekFilterDisplay />
          {/* 表格内容 */}
          {dom}
        </>
      )}
    />
  );
};
