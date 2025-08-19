import { SearchOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Checkbox, DatePicker, Input, InputNumber, Popover, Radio, Select, Space, Switch, TimePicker } from 'antd';
import { createStyles } from 'antd-style';

import { useSearchContext } from './SearchContext';

const { RangePicker } = DatePicker;
const { RangePicker: TimeRangePicker } = TimePicker;

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
    searchWrapper: {
      width: 350,
      position: 'relative',
    },
    autoCompleteContainer: {
      width: '100%',
    },
    searchInput: {
      [`& .${prefixCls}-input`]: { fontSize: token.fontSize },
      [`& .${prefixCls}-input-prefix`]: { color: token.colorTextTertiary },
    },
    popoverContent: {
      [`& .${prefixCls}-popover-inner`]: { padding: 0 },
    },

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

// 搜索输入框组件
const SearchInput = () => {
  const { styles } = useStyles();
  const { searchValue, filterOptions, inputRef, setSearchValue, handleSearch, handleSelectColumn } = useSearchContext();

  // AutoComplete 选项
  const autoCompleteOptions = filterOptions?.map((option) => ({
    value: option.dataIndex,
    label: option.title,
  }));

  return (
    <AutoComplete ref={inputRef} className={styles.autoCompleteContainer} options={autoCompleteOptions} onSearch={setSearchValue} onSelect={handleSelectColumn} value={searchValue} allowClear>
      <Input placeholder="添加筛选条件" prefix={<SearchOutlined />} onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)} className={styles.searchInput} />
    </AutoComplete>
  );
};

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

        // 处理checkbox值的变化
        const handleCheckboxChange = (checkedValues: any[]) => {
          const allValues = options.map((opt) => opt.value);

          if (checkedValues.includes('__ALL__')) {
            // 如果选择了"全部"
            if (value && value.includes('__ALL__')) {
              // 如果之前已经选择了"全部"，现在取消选择，则清空所有选项
              onChange([]);
            } else {
              // 选择全部选项，但只返回实际的选项值，不包含__ALL__
              onChange(allValues);
            }
          } else {
            // 没有选择"全部"
            const filteredValues = checkedValues.filter((val) => val !== '__ALL__');

            // 如果选择了所有其他选项，自动加上"全部"显示状态，但实际值不包含__ALL__
            if (filteredValues.length === allValues.length && filteredValues.every((val) => allValues.includes(val))) {
              onChange(filteredValues);
            } else {
              onChange(filteredValues);
            }
          }
        };

        // 处理显示值：如果选择了所有选项，则在显示时加上__ALL__
        const displayValue = (() => {
          const currentValue = value || [];
          const allValues = options.map((opt) => opt.value);

          // 如果当前选择的值包含了所有选项，则在显示时加上__ALL__
          if (currentValue.length === allValues.length && allValues.every((val) => currentValue.includes(val))) {
            return ['__ALL__', ...currentValue];
          }
          return currentValue;
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

// 值选择器组件
const ValueSelector = () => {
  const { styles } = useStyles();
  const { selectedColumn, tempValue, setTempValue, confirmAddFilter, getValueTypeConfig, getColumnOptions } = useSearchContext();

  if (!selectedColumn) return null;

  const config = getValueTypeConfig(selectedColumn.valueType);

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
    const config = getValueTypeConfig(selectedColumn.valueType);
    // 根据不同类型设置合适的初始值
    switch (config.componentType) {
      case 'checkbox':
        setTempValue([]);
        break;
      case 'switch':
        setTempValue(false);
        break;
      default:
        setTempValue(null);
    }
  };

  return (
    <div className={getPopoverWidth()}>
      <div className={styles.valueSelectorContent}>
        <ComponentRenderer column={selectedColumn} value={tempValue} onChange={setTempValue} className={['radio', 'checkbox'].includes(config.componentType) ? styles.verticalStyle : ''} />
      </div>
      <div className={styles.valueSelectorActions}>
        <Space size="small">
          <Button size="small" onClick={handleReset}>
            重置
          </Button>
          <Button type="primary" size="small" onClick={confirmAddFilter}>
            确定
          </Button>
        </Space>
      </div>
    </div>
  );
};

// 主搜索输入组件
export const CustomSearchInput = () => {
  const { styles } = useStyles();
  const { showValueSelector, cancelValueSelector } = useSearchContext();

  return (
    <div className={styles.searchWrapper}>
      <Popover
        content={<ValueSelector />}
        trigger="click"
        arrow={false}
        open={showValueSelector}
        onOpenChange={(visible) => {
          if (!visible) {
            cancelValueSelector();
          }
        }}
        overlayClassName={styles.popoverContent}
        placement="bottomLeft"
      >
        <SearchInput />
      </Popover>
    </div>
  );
};
