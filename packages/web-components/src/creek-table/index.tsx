import { ParamsType } from '@ant-design/pro-components';

import { CreekSearchProvider } from '../creek-search';

import { SearchProTable } from './SearchTable';
import { CreekTableProps } from './type';

export const CreekTable = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: CreekTableProps<T, U, ValueType>) => {
  const { columns = [],  onSubmit, ...restProps } = props;

  return (
    <CreekSearchProvider columns={columns} onSubmit={onSubmit}>
      <SearchProTable columns={columns} {...restProps} />
    </CreekSearchProvider>
  );
};
