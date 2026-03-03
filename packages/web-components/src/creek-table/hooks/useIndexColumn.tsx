import { ProColumns } from '@ant-design/pro-components';
import { useMemo } from 'react';

export const useIndexColumn = <T = any, ValueType = 'text'>(
  columns: ProColumns<T, ValueType>[] = [],
  showIndex: boolean = true,
) => {
  return useMemo(() => {
    if (!showIndex) {
      return columns;
    }
    const indexColumn: ProColumns<T, ValueType> = {
      title: '序号',
      dataIndex: 'index',
      width: 48,
      fixed: 'left',
      disable: true,
      render: (dom, entity, index, action, schema) => {
        const { current = 1, pageSize = 20 } = action?.pageInfo || {};
        return (current - 1) * pageSize + index + 1;
      },
    };
    return [indexColumn, ...columns];
  }, [columns, showIndex]);
};
