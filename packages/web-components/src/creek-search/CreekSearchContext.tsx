import { ParamsType, ProColumnType, ProTableProps } from '@ant-design/pro-components';
import dayjs, { Dayjs } from 'dayjs';
import _ from 'lodash';
import React, { createContext, ReactNode, useContext, useRef, useState } from 'react';

import { CreekSearchAddFilterOption, CreekSearchFilter } from './type';

// ValueType配置接口
interface ValueTypeConfig {
  // 是否需要显示值选择器
  showValueSelector: boolean;
  // 日期格式化字符串
  dateFormat?: string;
  // 是否为范围类型
  isRange?: boolean;
  // 是否为日期时间类型
  isDateTime?: boolean;
  // 显示名称
  displayName: string;
  // 组件类型标识
  componentType: 'input' | 'select' | 'date' | 'dateRange' | 'time' | 'timeRange' | 'number' | 'switch' | 'radio' | 'checkbox';
}

// ValueType配置映射表
const VALUE_TYPE_CONFIG_MAP: Record<ProColumnType<any, any>['valueType'], ValueTypeConfig> = {
  // 文本输入类
  text: {
    showValueSelector: false,
    displayName: '文本',
    componentType: 'input',
  },
  textarea: {
    showValueSelector: false,
    displayName: '多行文本',
    componentType: 'input',
  },
  password: {
    showValueSelector: false,
    displayName: '密码',
    componentType: 'input',
  },

  // 数字类
  digit: {
    showValueSelector: true,
    displayName: '数字',
    componentType: 'number',
  },
  money: {
    showValueSelector: true,
    displayName: '金额',
    componentType: 'number',
  },
  percent: {
    showValueSelector: true,
    displayName: '百分比',
    componentType: 'number',
  },

  // 选择类
  select: {
    showValueSelector: true,
    displayName: '选择器',
    componentType: 'select',
  },
  radio: {
    showValueSelector: true,
    displayName: '单选',
    componentType: 'radio',
  },
  radioButton: {
    showValueSelector: true,
    displayName: '单选按钮',
    componentType: 'radio',
  },
  checkbox: {
    showValueSelector: true,
    displayName: '多选',
    componentType: 'checkbox',
  },
  switch: {
    showValueSelector: true,
    displayName: '开关',
    componentType: 'radio',
  },

  // 日期类 - 单选
  date: {
    showValueSelector: true,
    dateFormat: 'YYYY-MM-DD',
    isDateTime: true,
    isRange: false,
    displayName: '日期',
    componentType: 'date',
  },
  dateWeek: {
    showValueSelector: true,
    dateFormat: 'YYYY-wo',
    isDateTime: true,
    isRange: false,
    displayName: '周',
    componentType: 'date',
  },
  dateMonth: {
    showValueSelector: true,
    dateFormat: 'YYYY-MM',
    isDateTime: true,
    isRange: false,
    displayName: '月份',
    componentType: 'date',
  },
  dateQuarter: {
    showValueSelector: true,
    dateFormat: 'YYYY-[Q]Q',
    isDateTime: true,
    isRange: false,
    displayName: '季度',
    componentType: 'date',
  },
  dateYear: {
    showValueSelector: true,
    dateFormat: 'YYYY',
    isDateTime: true,
    isRange: false,
    displayName: '年份',
    componentType: 'date',
  },
  dateTime: {
    showValueSelector: true,
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    isDateTime: true,
    isRange: false,
    displayName: '日期时间',
    componentType: 'date',
  },
  time: {
    showValueSelector: true,
    dateFormat: 'HH:mm:ss',
    isDateTime: true,
    isRange: false,
    displayName: '时间',
    componentType: 'time',
  },

  // 日期类 - 范围
  dateRange: {
    showValueSelector: true,
    dateFormat: 'YYYY-MM-DD',
    isDateTime: true,
    isRange: true,
    displayName: '日期范围',
    componentType: 'dateRange',
  },
  dateTimeRange: {
    showValueSelector: true,
    dateFormat: 'YYYY-MM-DD HH:mm:ss',
    isDateTime: true,
    isRange: true,
    displayName: '日期时间范围',
    componentType: 'dateRange',
  },
  timeRange: {
    showValueSelector: true,
    dateFormat: 'HH:mm:ss',
    isDateTime: true,
    isRange: true,
    displayName: '时间范围',
    componentType: 'timeRange',
  },
  dateWeekRange: {
    showValueSelector: true,
    dateFormat: 'YYYY-wo',
    isDateTime: true,
    isRange: true,
    displayName: '周范围',
    componentType: 'dateRange',
  },
  dateMonthRange: {
    showValueSelector: true,
    dateFormat: 'YYYY-MM',
    isDateTime: true,
    isRange: true,
    displayName: '月份范围',
    componentType: 'dateRange',
  },
  dateQuarterRange: {
    showValueSelector: true,
    dateFormat: 'YYYY-[Q]Q',
    isDateTime: true,
    isRange: true,
    displayName: '季度范围',
    componentType: 'dateRange',
  },
  dateYearRange: {
    showValueSelector: true,
    dateFormat: 'YYYY',
    isDateTime: true,
    isRange: true,
    displayName: '年份范围',
    componentType: 'dateRange',
  },
};

export interface SearchContextValue<T extends ParamsType, U extends ParamsType, ValueType = 'text'> {
  // 状态
  searchValue: string;
  filters: CreekSearchFilter[];
  showValueSelector: boolean;
  selectedColumn: ProColumnType<T, U>;
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
  handelRest: () => void;

  // 工具方法
  getColumnOptions: (column: any) => Array<{ label: string; value: string }>;
  getDisplayText: (column: any, value: any) => any;
  hasOptions: (column: any) => boolean;
  filtersToParams: (filters: CreekSearchFilter[]) => ParamsType;
  getValueTypeConfig: (valueType?: ProColumnType<T, U>['valueType']) => ValueTypeConfig;
  formatDateValue: (value: any, config: ValueTypeConfig) => string | string[];
  shouldShowValueSelector: (column: any) => boolean;
}

const SearchContext = createContext<SearchContextValue<any, any, any> | null>(null);

export const useSearchContext = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>() => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within CreekSearchProvider');
  }
  return context as SearchContextValue<T, U, ValueType>;
};

interface CreekSearchProviderProps<T extends ParamsType, U extends ParamsType, ValueType = 'text'> {
  columns: ProTableProps<T, U, ValueType>['columns'];
  onSubmit?: (params: U) => void;
  beforeSearchSubmit?: (params: Record<string, any>) => Record<string, any>;
  children: ReactNode;
}

export const CreekSearchProvider = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>({
  columns = [],
  onSubmit,
  beforeSearchSubmit,
  children,
}: CreekSearchProviderProps<T, U, ValueType>) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [filters, setFilters] = useState<CreekSearchFilter[]>([]);
  const [showValueSelector, setShowValueSelector] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<any>(null);
  const [tempValue, setTempValue] = useState<any>(null);

  const inputRef = useRef<any>(null);

  // 筛选条件配置
  const filterOptions = columns?.filter((item) => !(item.search === false || item.hideInSearch === true));

  // 获取valueType配置
  const getValueTypeConfig = (valueType?: ProColumnType<T, U>['valueType']) => {
    // 如果valueType为undefined，使用默认的text类型
    const validValueType = valueType || 'text';
    return (VALUE_TYPE_CONFIG_MAP[validValueType] || VALUE_TYPE_CONFIG_MAP['text']) as unknown as ValueTypeConfig;
  };

  // 判断是否需要显示值选择器
  const shouldShowValueSelector = (column: any): boolean => {
    const config = getValueTypeConfig(column.valueType);
    return config.showValueSelector || hasOptions(column);
  };

  // 格式化日期值
  const formatDateValue = (value: any, config: ValueTypeConfig): string | string[] => {
    if (!value || !config.isDateTime) return value;

    const formatValue = (val: any): string => {
      if (!val) return val;
      const day = val.format ? (val as Dayjs) : dayjs(val);
      return day.format(config.dateFormat);
    };

    if (config.isRange && Array.isArray(value)) {
      const [start, end] = value;
      return [formatValue(start), formatValue(end)];
    }

    return formatValue(value);
  };

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
    // 处理空值
    if (value === undefined || value === null || value === '') {
      return value;
    }

    const config = getValueTypeConfig(column.valueType);

    // 处理日期时间类型
    if (config.isDateTime) {
      const formattedValue = formatDateValue(value, config);
      if (config.isRange && Array.isArray(formattedValue)) {
        return `${formattedValue[0]} ~ ${formattedValue[1]}`;
      }
      return formattedValue;
    }

    // 处理数组类型（多选等）
    if (Array.isArray(value)) {
      return value.join(' | ');
    }

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

    if (column.valueType === 'switch' && typeof value === 'boolean') {
      return value ? '开启' : '关闭';
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

    if (selectedOption) {
      const shouldShow = shouldShowValueSelector(selectedOption);

      setSelectedColumn(selectedOption);
      setShowValueSelector(shouldShow);
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
    
    console.log(selectedColumn, '1111');

    if (!selectedColumn || tempValue == null) return;

    const { valueType, dataIndex } = selectedColumn;
    const config = getValueTypeConfig(valueType);

    let value: any = tempValue;
    let displayValue: string = '';

    if (config.isDateTime) {
      const formattedValue = formatDateValue(tempValue, config);
      value = formattedValue;

      if (config.isRange && Array.isArray(formattedValue)) {
        displayValue = `${formattedValue[0]} ~ ${formattedValue[1]}`;
      } else {
        displayValue = formattedValue as string;
      }
    } else {
      displayValue = getDisplayText(selectedColumn, tempValue);
    }

    console.log(value, 'value');
    addFilter(dataIndex as string, { value, displayText: displayValue });

    // 收尾
    setSearchValue('');
    setShowValueSelector(false);
    setSelectedColumn(null);
    setTempValue(null);
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

  // 重置所有条件
  const handelRest = () => {
    setFilters(() => {
      if (onSubmit && _.isFunction(onSubmit)) {
        onSubmit({} as U);
      }
      return [];
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
    handelRest,

    // 工具方法
    getColumnOptions,
    getDisplayText,
    hasOptions,
    filtersToParams,
    getValueTypeConfig,
    formatDateValue,
    shouldShowValueSelector,
  };

  return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>;
};
