import { ParamsType, ProTableProps } from '@ant-design/pro-components';

export type CreekTableProps<T extends ParamsType, U extends ParamsType, ValueType = 'text'> = Omit<ProTableProps<T, U, ValueType>, 'search'>;