import { ParamsType } from '@ant-design/pro-components';

import { SearchProTable } from './SearchTable';
import { CreekTableProps } from './type';

export const CreekTable = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: CreekTableProps<T, U, ValueType>) => {
  const { columns = [],  onSubmit, ...restProps } = props;

  return (
     <SearchProTable columns={columns} {...restProps} />
  );
};
