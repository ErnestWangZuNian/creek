import { SearchOutlined } from '@ant-design/icons';
import { ParamsType, ProFormColumnsType } from '@ant-design/pro-components';
import { AutoComplete, Button, Checkbox, DatePicker, Input, InputNumber, Popover, Radio, Select, Space, Tag } from 'antd';
import { createStyles } from 'antd-style';
import { useRef, useState } from 'react';

import { CreekTableProps } from '../type';

const { RangePicker } = DatePicker;

// 样式定义
const useStyles = createStyles(({ token }) => ({
  searchWrapper: {
    width: 350,
    position: 'relative',
  },
  autoCompleteContainer: {
    width: '100%',
  },
  filtersDisplay: {
    marginTop: token.marginSM,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: token.marginXS,
  },
  filtersLabel: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    marginRight: token.marginXS,
  },
  searchInput: {
    '& .ant-input': {
      fontSize: token.fontSize,
    },
    '& .ant-input-prefix': {
      color: token.colorTextTertiary,
    },
  },
  filterTag: {
    borderRadius: token.borderRadiusSM,
    fontSize: token.fontSizeSM,
  },
  valueSelectorContent: {
    marginBottom: token.marginSM,
  },
  valueSelectorActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: token.marginXS,
  },
  // 不同类型的宽度样式
  narrowSelector: {
    width: 200,
  },
  mediumSelector: {
    width: 280,
  },
  wideSelector: {
    width: 350,
  },
}));

export type CustomSearchProps<T extends ParamsType, U extends ParamsType, ValueType = 'text'> = {
  columns: CreekTableProps<T, U, ValueType>['columns'];
};

export const CustomSearch = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: CustomSearchProps<T, U, ValueType>) => {
  const { columns = [] } = props;
  const { styles } = useStyles();

  const [searchValue, setSearchValue] = useState<string>('');
  const [filters = [], setFilters] = useState<CustomSearchProps<T, U, ValueType>['columns']>([]);
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

  // 处理搜索输入
  const handleSearch = (value: string): void => {
    // 检测筛选条件格式 "条件名: 值"
    const colonIndex = value.lastIndexOf(':');

    if (colonIndex > 0) {
      const filterType = value.substring(0, colonIndex).trim();
      const filterValue = value.substring(colonIndex + 1).trim();

      const matchingFilter = filterOptions.find((f) => f.title === filterType || f.key === filterType);

      if (matchingFilter && filterValue) {
        addFilter(matchingFilter.dataIndex as string);
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
  const addFilter = (key: string) => {
    const filterConfig = filterOptions.find((f) => f.dataIndex === key);
    if (!filterConfig) return;

    setFilters((prev) => {
      const _prev = prev || [];
      return [..._prev, filterConfig];
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

      addFilter(selectedColumn.dataIndex as string);
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
    setFilters((prev) => prev?.filter((f) => f.dataIndex !== filterId));
  };

  // 根据值类型获取宽度样式
  const getPopoverWidth = (valueType: ProFormColumnsType['valueType']) => {
    switch (valueType) {
      case 'select':
      case 'radio':
      case 'checkbox':
      case 'radioButton':
      case 'switch':
        return styles.narrowSelector;

      case 'digit':
      case 'money':
        return styles.mediumSelector;
      case 'dateRange':
      case 'date':
      case 'timeRange':
      case 'dateMonth':
      case 'dateTime':
      case 'dateWeek':
      case 'dateWeekRange':
      case 'dateYearRange':
      case 'dateYear':
      default:
        return styles.wideSelector;
    }
  };

  // AutoComplete 选项
  const autoCompleteOptions = filterOptions.map((option) => ({
    value: option.dataIndex,
    label: option.title,
  }));

  // 渲染值选择器内容
  const renderValueSelectorContent = () => {
    if (!selectedColumn) return null;

    const { valueType } = selectedColumn;
    let selectorContent;

    // 如果有选项配置，优先使用 Select
    if (hasOptions(selectedColumn)) {
      const options = getColumnOptions(selectedColumn);
      const fieldProps = selectedColumn.fieldProps || {};
      const selectValueType = valueType;
      switch (selectValueType) {
        case 'radio':
          selectorContent = <Radio.Group {...fieldProps} value={tempValue} onChange={(e) => setTempValue(e.target.value)} options={options} />;
          break;
        case 'checkbox':
          selectorContent = <Checkbox.Group {...fieldProps} value={tempValue} onChange={(value) => setTempValue(value)} options={options} />;
          break;
        case 'select':
          selectorContent = <Select {...fieldProps} placeholder="请选择" value={tempValue} onChange={setTempValue} options={options} showSearch style={{ width: '100%' }} />;
          break;
      }
    } else {
      // 根据 valueType 渲染对应的组件
      switch (valueType) {
        case 'date':
          selectorContent = <DatePicker placeholder="请选择日期" value={tempValue} onChange={setTempValue} style={{ width: '100%' }} />;
          break;

        case 'dateRange':
          selectorContent = <RangePicker placeholder={['开始日期', '结束日期']} value={tempValue} onChange={setTempValue} style={{ width: '100%' }} />;
          break;

        case 'digit':
        case 'money':
          selectorContent = <InputNumber placeholder="请输入数字" value={tempValue} onChange={setTempValue} style={{ width: '100%' }} />;
          break;

        case 'switch':
          selectorContent = (
            <Select
              placeholder="请选择"
              value={tempValue}
              onChange={setTempValue}
              options={[
                { label: '是', value: true },
                { label: '否', value: false },
              ]}
              style={{ width: '100%' }}
            />
          );
          break;

        default:
          selectorContent = <Input placeholder="请输入值" value={tempValue} onChange={(e) => setTempValue(e.target.value)} style={{ width: '100%' }} />;
      }
    }

    return (
      <div className={getPopoverWidth(valueType)}>
        <div className={styles.valueSelectorContent}>{selectorContent}</div>
        <div className={styles.valueSelectorActions}>
          <Space size="small">
            <Button size="small" onClick={() => setTempValue(null)}>
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

  // 渲染筛选条件标签
  const renderFilterTags = (filterList: CustomSearchProps<T, U, ValueType>['columns'], color: string = 'blue') => (
    <Space size={4} wrap>
      {filterList?.map((filter) => (
        <Tag key={filter.dataIndex as string} closable onClose={() => removeFilter(filter.dataIndex as string)} color={color} className={styles.filterTag}>
          {filter.title as string}
        </Tag>
      ))}
    </Space>
  );

  return (
    <div className={styles.searchWrapper}>
      <Popover
        content={renderValueSelectorContent()}
        trigger="click"
        showArrow={false}
        open={showValueSelector}
        onOpenChange={(visible) => {
          if (!visible) {
            cancelValueSelector();
          }
        }}
        style={{
          padding: 0,
        }}
        placement="bottomLeft"
      >
        <AutoComplete ref={inputRef} className={styles.autoCompleteContainer} options={autoCompleteOptions} onSearch={setSearchValue} onSelect={handleSelectColumn} value={searchValue} allowClear>
          <Input placeholder="添加筛选条件" prefix={<SearchOutlined />} onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)} className={styles.searchInput} />
        </AutoComplete>
      </Popover>

      {/* 显示当前筛选条件 */}
      {filters.length > 0 && (
        <div className={styles.filtersDisplay}>
          <span className={styles.filtersLabel}>当前筛选条件：</span>
          {renderFilterTags(filters, 'processing')}
        </div>
      )}
    </div>
  );
};
