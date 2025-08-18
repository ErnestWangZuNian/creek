import { ParamsType, ProTable } from '@ant-design/pro-components';

import { CustomSearchInput, FilterDisplay, SearchProvider } from './custom-search';
import { CreekTableProps } from './type';

export const CreekTable = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: CreekTableProps<T, U, ValueType>) => {
  const { columns = [], ...restProps } = props;

  return (
    <SearchProvider columns={columns}>
      <ProTable<T, U, ValueType>
        {...restProps}
        columns={columns}
        search={false}
        // 在 headerTitle 中只放搜索输入框
        headerTitle={<CustomSearchInput />}
        // 在表格内容区上方显示筛选条件
        tableViewRender={(_, dom) => (
          <>
            {/* 筛选条件展示区域 */}
            <FilterDisplay />
            {/* 表格内容 */}
            {dom}
          </>
        )}
      />
    </SearchProvider>
  );
};
