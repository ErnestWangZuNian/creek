import { ParamsType, ProColumnType } from '@ant-design/pro-components';
import { useMemoizedFn, useSafeState } from 'ahooks';
import { useMemo } from 'react';

import { CreekSearchValueSelector, useSearchContext } from '../../creek-search';
import { CreekTableProps } from '../type';

interface UseAutoAddFilterToColumnsProps<T extends ParamsType, U extends ParamsType, ValueType = 'text'> {
  columns: CreekTableProps<T, U, ValueType>['columns'];
  autoAddFilterForColumn?: boolean;
}

interface UseAutoAddFilterToColumnsReturn<T extends ParamsType, U extends ParamsType, ValueType> {
  columnsWithFilter: CreekTableProps<T, U, ValueType>['columns'];
  getColumnKey: (column: ProColumnType<T, U>) => string;
}

export const useAutoAddFilterToColumns = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>({
  columns,
  autoAddFilterForColumn,
}: UseAutoAddFilterToColumnsProps<T, U, ValueType>): UseAutoAddFilterToColumnsReturn<T, U, ValueType> => {
  const { hasOptions, setSelectedColumn, filters, filterOptions } = useSearchContext();

  // 管理每列的下拉框状态
  const [filterOpenMap, setFilterOpenMap] = useSafeState<Record<string, boolean>>({});

  // 获取列的唯一标识
  const getColumnKey = useMemoizedFn((column: ProColumnType<T, U>) => {
    return column.dataIndex as string;
  });

  // 控制特定列的下拉框开关
  const setColumnFilterOpen = useMemoizedFn((columnKey: string, open: boolean) => {
    setFilterOpenMap((prev) => ({
      ...prev,
      [columnKey]: open,
    }));
  });

  // 关闭特定列的下拉框
  const closeColumnFilter = useMemoizedFn((columnKey: string) => {
    setFilterOpenMap((prev) => ({
      ...prev,
      [columnKey]: false,
    }));
  });

  // 自动为列添加筛选功能
  const autoAddFilterToColumns = useMemoizedFn((columns: CreekTableProps<T, U, ValueType>['columns'] = []) => {
    return columns.map((column) => {
      if (hasOptions(column) && filterOptions?.map(item => item.dataIndex).includes(column.dataIndex as string)) {
        const newColumn = { ...column };
        const columnKey = getColumnKey(newColumn as ProColumnType<T, U>);

        return {
          ...newColumn,
          filters: newColumn?.filters || true,
          onFilter: newColumn?.onFilter || false,
          filtered: filters.map((item) => item.dataIndex).includes(columnKey),
          filterDropdown: (
            <CreekSearchValueSelector
              onConfirm={() => {
                // 点击确认时关闭当前列的下拉框
                closeColumnFilter(columnKey);
              }}
            />
          ),
          filterDropdownProps: {
            open: filterOpenMap[columnKey] || false,
            onOpenChange: (open: boolean) => {
              if (open) {
                const selectedColumn = columns.find((item) => item.dataIndex === columnKey);
                setSelectedColumn(selectedColumn);
              }
              setColumnFilterOpen(columnKey, open);
            },
          },
        };
      }
      return column;
    });
  });

  const columnsWithFilter = useMemo(() => (autoAddFilterForColumn ? autoAddFilterToColumns(columns) : columns), [columns, filters, autoAddFilterToColumns, filterOpenMap]);

  return {
    columnsWithFilter,
    getColumnKey,
  };
};
