import { ProColumns } from '@ant-design/pro-components';
import { useMemo } from 'react';

import { useT } from '@/utils/i18n';

export const useIndexColumn = <T = any, ValueType = 'text'>(columns: ProColumns<T, ValueType>[] = [], showIndex: boolean = true) => {
  const t = useT();

  return useMemo(() => {
    if (!showIndex) {
      return columns;
    }
    const indexColumn: ProColumns<T, ValueType> = {
      title: t('creek-table.hooks.useIndexColumn.xuHao', '序号'),
      dataIndex: 'index',
      width: 48,
      fixed: 'left',
      disable: true,
      hideInSearch: true,
      render: (dom, entity, index, action, schema) => {
        const { current = 1, pageSize = 20 } = action?.pageInfo || {};
        return (current - 1) * pageSize + index + 1;
      },
    };
    return [indexColumn, ...columns];
  }, [columns, showIndex, t]);
};
