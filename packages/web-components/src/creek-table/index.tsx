import { ParamsType, ProTable, } from '@ant-design/pro-components';

import { CustomSearch } from './custom-search';
import { CreekTableProps } from './type';

export const CreekTable = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: CreekTableProps<T, U, ValueType>) => (
  <ProTable<T, U, ValueType> {...props} search={false} headerTitle={<CustomSearch columns={props.columns} />} />
);
