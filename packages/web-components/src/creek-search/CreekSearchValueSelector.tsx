import { ParamsType } from '@ant-design/pro-components';
import { Button, Checkbox, DatePicker, Input, InputNumber, Radio, Select, Space, Switch, TimePicker } from 'antd';
import { createStyles } from 'antd-style';
import _ from 'lodash';

import { useEffect, useMemo } from 'react';
import { useSearchContext } from './CreekSearchContext';

const { RangePicker } = DatePicker;
const { RangePicker: TimeRangePicker } = TimePicker;

// 组件渲染器接口
interface ComponentRendererProps {
  column: any;
  value: any;
  onChange: (value: any) => void;
  className?: string;
}

// 各类型组件渲染器
const ComponentRenderer = ({ column, value, onChange, className }: ComponentRendererProps) => {
  const { getValueTypeConfig, getColumnOptions, hasOptions } = useSearchContext();

  const { valueType, fieldProps = {} } = column;

  const config = getValueTypeConfig(valueType);
  const baseStyle = { width: '100%' };
  const mergedProps = { ...fieldProps, style: { ...baseStyle, ...fieldProps.style } };

  // 如果有选项配置，优先使用选项组件
  if (hasOptions(column)) {
    const options = getColumnOptions(column);

    switch (config.componentType) {
      case 'radio':
        // 如果valueType是switch，使用RadioButton样式
        const radioOptions = options.map((option) => ({
          ...option,
        }));

        return <Radio.Group {...mergedProps} className={className} value={value} onChange={(e) => onChange(e.target.value)} options={radioOptions} />;

      case 'checkbox':
        // 为checkbox添加"全部"选项
        const allOption = { label: '全部', value: '__ALL__' };
        const checkboxOptions = [allOption, ...options];

        const handleCheckboxChange = (checkedValues: any[]) => {
          const clickedAll = checkedValues.includes('__ALL__');
         
          const prevAllSelected = (value || []).length === options.length;

          if (clickedAll) {
            // 用户点击了“全部”
            if (prevAllSelected) {
              // 如果之前是全选，则取消全选
              onChange([]);
            } else {
              // 否则全选
              onChange(options.map((opt) => opt.value));
            }
          } else {
            // 用户点击了具体选项
            const filtered = checkedValues.filter((v) => v !== '__ALL__');
            onChange(filtered);
          }
        };

        const displayValue = (() => {
          const currentValue = value || [];
          const allValues = options.map((opt) => opt.value);
          const isAllSelected = allValues.length > 0 && allValues.every((v) => currentValue.includes(v));

          return isAllSelected ? ['__ALL__', ...currentValue] : currentValue;
        })();

        return <Checkbox.Group {...mergedProps} className={className} value={displayValue} onChange={handleCheckboxChange} options={checkboxOptions} />;

      case 'select':
      default:
        return <Select {...mergedProps} placeholder="请选择" value={value} onChange={onChange} options={options} showSearch allowClear />;
    }
  }

  // 根据组件类型渲染对应组件
  switch (config.componentType) {
    case 'input':
      return <Input {...mergedProps} placeholder={fieldProps.placeholder || '请输入值'} value={value} onChange={(e) => onChange(e.target.value)} />;

    case 'number':
      return <InputNumber {...mergedProps} placeholder={fieldProps.placeholder || '请输入数字'} value={value} onChange={onChange} />;

    case 'select':
      // 处理switch类型的特殊情况
      if (valueType === 'switch') {
        return <Select {...mergedProps} placeholder="请选择" value={value} onChange={onChange} allowClear />;
      }
      return <Select {...mergedProps} placeholder="请选择" value={value} onChange={onChange} allowClear />;

    case 'switch':
      return <Switch {...mergedProps} checked={value} onChange={onChange} />;

    case 'date':
      const dateProps = {
        ...mergedProps,
        placeholder: fieldProps.placeholder || '请选择日期',
        value: value,
        onChange: onChange,
      };

      // 根据具体的日期类型渲染不同的组件
      switch (valueType) {
        case 'dateTime':
          return <DatePicker {...dateProps} showTime />;
        case 'dateMonth':
          return <DatePicker {...dateProps} picker="month" />;
        case 'dateWeek':
          return <DatePicker {...dateProps} picker="week" />;
        case 'dateQuarter':
          return <DatePicker {...dateProps} picker="quarter" />;
        case 'dateYear':
          return <DatePicker {...dateProps} picker="year" />;
        case 'date':
        default:
          return <DatePicker {...dateProps} />;
      }

    case 'dateRange':
      const rangeProps = {
        ...mergedProps,
        placeholder: fieldProps.placeholder || ['开始日期', '结束日期'],
        value: value,
        onChange: onChange,
      };

      // 根据具体的日期范围类型渲染不同的组件
      switch (valueType) {
        case 'dateTimeRange':
          return <RangePicker {...rangeProps} showTime />;
        case 'dateMonthRange':
          return <RangePicker {...rangeProps} picker="month" />;
        case 'dateWeekRange':
          return <RangePicker {...rangeProps} picker="week" />;
        case 'dateQuarterRange':
          return <RangePicker {...rangeProps} picker="quarter" />;
        case 'dateYearRange':
          return <RangePicker {...rangeProps} picker="year" />;
        case 'dateRange':
        default:
          return <RangePicker {...rangeProps} />;
      }

    case 'time':
      return <TimePicker {...mergedProps} placeholder={fieldProps.placeholder || '请选择时间'} value={value} onChange={onChange} />;

    case 'timeRange':
      return <TimeRangePicker {...mergedProps} placeholder={fieldProps.placeholder || ['开始时间', '结束时间']} value={value} onChange={onChange} />;

    case 'radio':
      const iswitch = valueType === 'switch';
      const radioOptions = [
        { label: '开', value: true },
        { label: '关', value: false },
      ];
      const _radioOptions = iswitch ? radioOptions : mergedProps.options;

      // 如果valueType是switch，使用RadioButton样式
      return <Radio.Group {...mergedProps} options={_radioOptions} className={className} value={value} onChange={(e) => onChange(e.target.value)} />;

    case 'checkbox':
      return <Checkbox.Group {...mergedProps} className={className} value={value} onChange={onChange} />;

    default:
      return <Input {...mergedProps} placeholder="请输入值" value={value} onChange={(e) => onChange(e.target.value)} />;
  }
};

// 样式定义
const useStyles = createStyles(({ token, prefixCls }) => {
  const selectedBgColor = '#F5F7F9';

  // 公共选项样式
  const optionBase = {
    padding: 8,
    borderRadius: 2,
    marginBottom: 4,
    marginInlineEnd: 0,
    '&:hover': { backgroundColor: selectedBgColor },
  };

  return {
    valueSelectorContent: {
      padding: 8,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,

      // 复用公共样式
      [`& .${prefixCls}-checkbox-wrapper, & .${prefixCls}-radio-wrapper`]: optionBase,

      // checked 状态
      [`& .${prefixCls}-checkbox-wrapper-checked, & .${prefixCls}-radio-wrapper-checked`]: {
        backgroundColor: selectedBgColor,
      },
    },

    valueSelectorActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: token.marginXS,
      padding: 8,
    },
    verticalStyle: {
      display: 'flex',
      flexDirection: 'column',
    },

    // 不同宽度样式
    smallSelector: { width: 80 },
    narrowSelector: { width: 150 },
    mediumSelector: { width: 280 },
    wideSelector: { width: 350 },
  };
});

export type CreekSearchValueSelectorProps<T extends ParamsType, U extends ParamsType> = {
  onConfirm?: () => void;
};

// 根据不同类型获取初始值
const getInitialValue = (componentType: string) => {
  switch (componentType) {
    case 'checkbox':
      return [];
    case 'switch':
      return false;
    case 'number':
      return undefined; // InputNumber 使用 undefined 而不是 null
    default:
      return null;
  }
};

// 值选择器组件
export const CreekSearchValueSelector = <T extends ParamsType, U extends ParamsType>(props: CreekSearchValueSelectorProps<T, U>) => {
  const { styles } = useStyles();
  const searchContext = useSearchContext();

  const { selectedColumn, tempValue, setTempValue, confirmAddFilter, getValueTypeConfig, filters } = searchContext;
  const { onConfirm } = props;

  const config = getValueTypeConfig(selectedColumn?.valueType);

  // 获取当前过滤器的值
  const currentFilterValue = useMemo(() => {
    const currentFilter = filters.find((item) => item.dataIndex === selectedColumn?.dataIndex);
    return currentFilter?.value;
  }, [filters, selectedColumn]);

  // 计算实际显示的值
  const actualValue = useMemo(() => {
    // 如果 tempValue 已设置（不是 null 和 undefined），优先使用 tempValue
    if (tempValue !== null && tempValue !== undefined) {
      return tempValue;
    }
    // 否则使用当前过滤器的值，如果也没有则使用初始值
    return currentFilterValue ?? getInitialValue(config.componentType);
  }, [tempValue, currentFilterValue, selectedColumn?.valueType, config.componentType]);

  // 当选择的列发生变化时，重置 tempValue 为当前过滤器的值
  useEffect(() => {
    if (selectedColumn) {
      const currentFilter = filters.find((item) => item.dataIndex === selectedColumn.dataIndex);
      if (currentFilter?.value !== undefined) {
        setTempValue(currentFilter.value);
      } else {
        // 如果没有现有的过滤器值，设置为初始值
        setTempValue(getInitialValue(config.componentType));
      }
    }
  }, [selectedColumn?.dataIndex]); // 只在 selectedColumn.dataIndex 变化时触发

  // 根据组件类型获取合适的宽度
  const getPopoverWidth = () => {
    switch (config.componentType) {
      case 'select':
      case 'radio':
      case 'checkbox':
      case 'switch':
        return styles.narrowSelector;
      case 'number':
        return styles.mediumSelector;
      case 'date':
      case 'dateRange':
      case 'time':
      case 'timeRange':
      default:
        return styles.wideSelector;
    }
  };

  // 重置值的处理
  const handleReset = () => {
    const initialValue = getInitialValue(config.componentType);
    setTempValue(initialValue);
  };

  // 处理值的变化
  const handleValueChange = (value: any) => {
    console.log(value, 'handleValueChange');
    setTempValue(value);
  };

  console.log('actualValue:', actualValue, 'tempValue:', tempValue, 'currentFilterValue:', currentFilterValue);

  return selectedColumn ? (
    <div className={getPopoverWidth()}>
      <div className={styles.valueSelectorContent}>
        <ComponentRenderer column={selectedColumn} value={actualValue} onChange={handleValueChange} className={['radio', 'checkbox'].includes(config.componentType) ? styles.verticalStyle : ''} />
      </div>
      <div className={styles.valueSelectorActions}>
        <Space size="small">
          <Button size="small" onClick={handleReset}>
            重置
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              confirmAddFilter();
              if (_.isFunction(onConfirm)) {
                onConfirm();
              }
            }}
          >
            确定
          </Button>
        </Space>
      </div>
    </div>
  ) : null;
};
