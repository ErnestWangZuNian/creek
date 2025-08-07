import { ProTable, ProTableProps } from '@ant-design/pro-components';

import { CustomSearch } from './custom-search';

export type ParamsType = Record<string, any>;

export type CreekTableProps<T extends ParamsType, U extends ParamsType, ValueType = 'text'> = Omit<ProTableProps<T, U, ValueType>, 'search'>;

export const CreekTable = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: CreekTableProps<T, U, ValueType>) => (
  <ProTable<T, U, ValueType> {...props} search={false} headerTitle={<CustomSearch />} />
);
