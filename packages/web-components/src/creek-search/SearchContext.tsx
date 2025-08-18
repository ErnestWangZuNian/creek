import { ParamsType, ProFormColumnsType, ProTableProps } from '@ant-design/pro-components';
import _ from 'lodash';
import React, { createContext, ReactNode, useContext, useRef, useState } from 'react';

import { CreekSearchAddFilterOption, CreekSearchFilter } from './type';

export interface SearchContextValue<T extends ParamsType, U extends ParamsType, ValueType = 'text'> {
  // 状态
  searchValue: string;
  filters: CreekSearchFilter[];
  showValueSelector: boolean;
  selectedColumn: any;
  tempValue: any;

  // 引用
  inputRef: React.RefObject<any>;

  // 配置
  columns: ProTableProps<T, U, ValueType>['columns'];
  filterOptions: ProTableProps<T, U, ValueType>['columns'];
  onSubmit?: (params: U) => void;
  beforeSearchSubmit?: (params: Record<string, any>) => Record<string, any>;

  // 状态更新方法
  setSearchValue: (value: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<CreekSearchFilter[]>>;
  setShowValueSelector: (show: boolean) => void;
  setSelectedColumn: (column: any) => void;
  setTempValue: (value: any) => void;

  // 业务方法
  handleSearch: (value: string) => void;
  handleSelectColumn: (value: string) => void;
  addFilter: (key: string, option: CreekSearchAddFilterOption) => void;
  confirmAddFilter: () => void;
  cancelValueSelector: () => void;
  removeFilter: (filterId: string) => void;

  // 工具方法
  getColumnOptions: (column: any) => Array<{ label: string; value: string }>;
  getDisplayText: (column: any, value: any) => any;
  hasOptions: (column: any) => boolean;
  filtersToParams: (filters: CreekSearchFilter[]) => ParamsType;
}

const SearchContext = createContext<SearchContextValue<any, any, any> | null>(null);

export const useSearchContext = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>() => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within SearchProvider');
  }
  return context as SearchContextValue<T, U, ValueType>;
};

interface SearchProviderProps<T extends ParamsType, U extends ParamsType, ValueType = 'text'> {
  columns: ProTableProps<T, U, ValueType>['columns'];
  onSubmit?: (params: U) => void;
  beforeSearchSubmit?: (params: Record<string, any>) => Record<string, any>;
  children: ReactNode;
}

export const SearchProvider = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>({ columns = [], onSubmit, beforeSearchSubmit, children }: SearchProviderProps<T, U, ValueType>) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [filters, setFilters] = useState<CreekSearchFilter[]>([]);
  const [showValueSelector, setShowValueSelector] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<any>(null);
  const [tempValue, setTempValue] = useState<any>(null);

  const inputRef = useRef<any>(null);

  // 筛选条件配置
  const filterOptions = columns?.filter((item) => item.search !== false || item.hideInSearch !== false);

  // 获取选项数据 - 兼容 valueEnum 和 fieldProps.options
  const getColumnOptions = (column: any) => {
    // 优先使用 valueEnum
    if (column.valueEnum) {
      if (typeof column.valueEnum === 'object') {
        return Object.entries(column.valueEnum).map(([key, value]: [string, any]) => ({
          label: typeof value === 'object' ? value.text || value.label || key : value,
          value: key,
        }));
      }
    }

    // 然后检查 fieldProps.options
    if (column.fieldProps?.options) {
      return column.fieldProps.options.map((option: any) => ({
        label: option.label || option.text || option.value,
        value: option.value,
      }));
    }

    return [];
  };

  // 获取显示文本 - 兼容 valueEnum 和 fieldProps.options
  const getDisplayText = (column: any, value: any) => {
    // 先尝试从 valueEnum 获取
    if (column.valueEnum && column.valueEnum[value]) {
      const enumItem = column.valueEnum[value];
      return typeof enumItem === 'object' ? enumItem.text || enumItem.label || value : enumItem;
    }

    // 再尝试从 fieldProps.options 获取
    if (column.fieldProps?.options) {
      const option = column.fieldProps.options.find((opt: any) => opt.value === value);
      if (option) {
        return option.label || option.text || option.value;
      }
    }

    return value;
  };

  // 判断是否有选项配置
  const hasOptions = (column: any) => {
    return !!(column.valueEnum || column.fieldProps?.options);
  };

  // 将 filters 转换成 params 对象
  const filtersToParams: SearchContextValue<T, U, ValueType>['filtersToParams'] = (filters) => {
    let params = {} as ParamsType;

    // 将 filters 数组转换为 params 对象
    filters.forEach((filter) => {
      if (filter.dataIndex && filter.value !== undefined && filter.value !== null) {
        params[filter.dataIndex] = filter.value;
      }
    });

    // 如果存在 beforeSearchSubmit 钩子，则调用它来修改 params
    if (beforeSearchSubmit && _.isFunction(beforeSearchSubmit)) {
      params = beforeSearchSubmit(params);
    }

    return params;
  };

  // 处理搜索输入
  const handleSearch = (value: string): void => {
    // 检测筛选条件格式 "条件名: 值"
    const colonIndex = value.lastIndexOf(':');

    if (colonIndex > 0) {
      const filterType = value.substring(0, colonIndex).trim();
      const filterValue = value.substring(colonIndex + 1).trim();

      const matchingFilter = filterOptions.find((f) => f.title === filterType || f.key === filterType);

      if (matchingFilter && filterValue) {
        addFilter(matchingFilter.dataIndex as string, {
          value: filterValue,
          displayText: getDisplayText(matchingFilter, filterValue),
        });
        setSearchValue('');
        return;
      }
    }
    setSearchValue(value);
  };

  // 处理选择列名
  const handleSelectColumn = (value: string) => {
    const selectedOption = filterOptions.find((option) => option.dataIndex === value);
    const needShowValueSelectorArray: (ProFormColumnsType['valueType'] | string)[] = [
      'select',
      'date',
      'dateRange',
      'timeRange',
      'dateMonth',
      'dateTime',
      'dateWeek',
      'dateWeekRange',
      'dateYearRange',
      'dateYear',
      'radio',
      'checkbox',
      'digit',
      'radioButton',
      'switch',
    ];

    if (selectedOption) {
      const valueType = selectedOption.valueType as ProFormColumnsType['valueType'];
      const shouldShowSelector = needShowValueSelectorArray.includes(valueType) || hasOptions(selectedOption);

      setSelectedColumn(selectedOption);
      setShowValueSelector(shouldShowSelector);
      setSearchValue(`${selectedOption.title}: `);
      setTempValue(null);
    }
  };

  // 添加筛选条件
  const addFilter: SearchContextValue<T, U, ValueType>['addFilter'] = (key, options) => {
    const filterConfig = filterOptions.find((f) => f.dataIndex === key);
    if (!filterConfig) return;

    setFilters((prev) => {
      let _prev = prev || [];

      const existingFilter = _prev.find((f) => f.dataIndex === key);

      if (existingFilter) {
        _prev = _prev.map((item) => {
          if (item.dataIndex === key) {
            return {
              ...item,
              value: options.value,
              displayText: getDisplayText(filterConfig, options.value),
            };
          }
          return item;
        });
      } else {
        _prev.push({
          dataIndex: key,
          title: filterConfig.title as string,
          value: options.value,
          displayText: getDisplayText(filterConfig, options.value),
        });
      }

      const _filters = [..._prev];

      const params = filtersToParams(_filters);

      if (onSubmit && _.isFunction(onSubmit)) {
        onSubmit(params as U);
      }

      return _filters;
    });
  };

  // 确认添加筛选条件
  const confirmAddFilter = () => {
    if (selectedColumn && tempValue !== null && tempValue !== undefined) {
      let displayValue = tempValue;

      // 处理不同类型的显示值
      if (selectedColumn.valueType === 'dateRange' && Array.isArray(tempValue)) {
        displayValue = `${tempValue[0]?.format('YYYY-MM-DD')} ~ ${tempValue[1]?.format('YYYY-MM-DD')}`;
      } else if (selectedColumn.valueType === 'date') {
        displayValue = tempValue.format('YYYY-MM-DD');
      } else if (hasOptions(selectedColumn)) {
        // 使用统一的获取显示文本方法
        displayValue = getDisplayText(selectedColumn, tempValue);
      }

      addFilter(selectedColumn.dataIndex as string, {
        value: tempValue,
        displayText: displayValue,
      });
      setSearchValue('');
      setShowValueSelector(false);
      setSelectedColumn(null);
      setTempValue(null);
    }
  };

  // 取消选择
  const cancelValueSelector = () => {
    setShowValueSelector(false);
    setSelectedColumn(null);
    setTempValue(null);
  };

  // 删除筛选条件
  const removeFilter = (filterId: string) => {
    setFilters((prev) => {
      const _prev = prev?.filter((f) => f.dataIndex !== filterId);

      const _filters = [..._prev];
      const params = filtersToParams(_filters);
      if (onSubmit && _.isFunction(onSubmit)) {
        onSubmit(params as U);
      }

      return _prev || [];
    });
  };

  const contextValue: SearchContextValue<T, U, ValueType> = {
    // 状态
    searchValue,
    filters,
    showValueSelector,
    selectedColumn,
    tempValue,

    // 引用
    inputRef,

    // 配置
    columns,
    filterOptions,
    onSubmit,
    beforeSearchSubmit,

    // 状态更新方法
    setSearchValue,
    setFilters,
    setShowValueSelector,
    setSelectedColumn,
    setTempValue,

    // 业务方法
    handleSearch,
    handleSelectColumn,
    addFilter,
    confirmAddFilter,
    cancelValueSelector,
    removeFilter,

    // 工具方法
    getColumnOptions,
    getDisplayText,
    hasOptions,
    filtersToParams,
  };

  return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>;
};
