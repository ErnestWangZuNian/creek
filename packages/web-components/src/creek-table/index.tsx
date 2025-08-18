import { ParamsType } from '@ant-design/pro-components';

import { SearchProvider } from '../creek-search';

import { SearchProTable } from './SearchTable';
import { CreekTableProps } from './type';

export const CreekTable = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: CreekTableProps<T, U, ValueType>) => {
  const { columns = [], ...restProps } = props;

  return (
    <SearchProvider columns={columns}>
      <SearchProTable columns={columns} {...restProps} />
    </SearchProvider>
  );
};
