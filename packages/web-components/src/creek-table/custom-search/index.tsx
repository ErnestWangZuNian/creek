import { SearchOutlined } from '@ant-design/icons';
import { ParamsType } from '@ant-design/pro-components';
import { AutoComplete, Button, DatePicker, Input, InputNumber, Popover, Select, Space, Switch, Tag } from 'antd';
import { createStyles } from 'antd-style';
import { useRef, useState } from 'react';
import { CreekTableProps } from '../type';

const { RangePicker } = DatePicker;

interface Filter {
  id: number;
  key: string;
  value: string;
  label: string;
}

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
  const [filters, setFilters] = useState<CustomSearchProps<T, U, ValueType>[]>([]);
  const [showValueSelector, setShowValueSelector] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<any>(null);
  const [tempValue, setTempValue] = useState<any>(null);

  const inputRef = useRef<any>(null);

  // 筛选条件配置
  const filterOptions = columns?.filter((item) => item.search !== false || item.hideInSearch !== false);

  // 处理搜索输入
  const handleSearch = (value: string): void => {
    // 检测筛选条件格式 "条件名: 值"
    const colonIndex = value.lastIndexOf(':');

    if (colonIndex > 0) {
      const filterType = value.substring(0, colonIndex).trim();
      const filterValue = value.substring(colonIndex + 1).trim();

      const matchingFilter = filterOptions.find((f) => f.title === filterType || f.key === filterType);

      if (matchingFilter && filterValue) {
        addFilter(matchingFilter.dataIndex as string, filterValue);
        setSearchValue('');
        return;
      }
    }
    setSearchValue(value);
  };

  // 处理选择列名
  const handleSelectColumn = (value: string): void => {
    const selectedOption = filterOptions.find((option) => `${option.title}: ` === value);
    if (selectedOption) {
      setSelectedColumn(selectedOption);
      setShowValueSelector(true);
      setSearchValue('');
      setTempValue(null);
    }
  };

  // 添加筛选条件
  const addFilter = (key: string, value: string): void => {
    const filterConfig = filterOptions.find((f) => f.dataIndex === key);
    if (!filterConfig) return;

    setFilters((prev) => [...prev, filterConfig]);
  };

  // 确认添加筛选条件
  const confirmAddFilter = (): void => {
    if (selectedColumn && tempValue !== null && tempValue !== undefined) {
      let displayValue = tempValue;

      // 处理不同类型的显示值
      if (selectedColumn.valueType === 'dateRange' && Array.isArray(tempValue)) {
        displayValue = `${tempValue[0]?.format('YYYY-MM-DD')} ~ ${tempValue[1]?.format('YYYY-MM-DD')}`;
      } else if (selectedColumn.valueType === 'date') {
        displayValue = tempValue.format('YYYY-MM-DD');
      } else if (selectedColumn.valueType === 'select' && selectedColumn.valueEnum) {
        const enumItem = selectedColumn.valueEnum[tempValue];
        displayValue = enumItem?.text || tempValue;
      }

      addFilter(selectedColumn.dataIndex as string, displayValue.toString());
      setShowValueSelector(false);
      setSelectedColumn(null);
      setTempValue(null);
    }
  };

  // 取消选择
  const cancelValueSelector = (): void => {
    setShowValueSelector(false);
    setSelectedColumn(null);
    setTempValue(null);
  };

  // 删除筛选条件
  const removeFilter = (filterId: number): void => {
    setFilters((prev) => prev.filter((f) => f.id !== filterId));
  };

  // 根据值类型获取宽度样式
  const getPopoverWidth = (valueType: string): string => {
    switch (valueType) {
      case 'select':
      case 'switch':
        return styles.narrowSelector;
      case 'date':
      case 'digit':
      case 'money':
        return styles.mediumSelector;
      case 'dateRange':
      default:
        return styles.wideSelector;
    }
  };

  // AutoComplete 选项
  const autoCompleteOptions = filterOptions.map((option) => ({
    value: `${option.title}: `,
    label: option.title,
  }));

  // 渲染值选择器内容
  const renderValueSelectorContent = () => {
    if (!selectedColumn) return null;

    const { valueType, valueEnum } = selectedColumn;
    let selectorContent;

    switch (valueType) {
      case 'select':
        const options = valueEnum
          ? Object.entries(valueEnum).map(([key, value]: [string, any]) => ({
              label: value.text || key,
              value: key,
            }))
          : [];
        selectorContent = (
          <Select
            placeholder="请选择"
            value={tempValue}
            onChange={setTempValue}
            options={options}
            showSearch
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            style={{ width: '100%' }}
          />
        );
        break;

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
          <div style={{ textAlign: 'center' }}>
            <Switch checked={tempValue} onChange={setTempValue} checkedChildren="是" unCheckedChildren="否" />
          </div>
        );
        break;

      default:
        selectorContent = <Input placeholder="请输入值" value={tempValue} onChange={(e) => setTempValue(e.target.value)} style={{ width: '100%' }} />;
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
  const renderFilterTags = (filterList: Filter[], color: string = 'blue') => (
    <Space size={4} wrap>
      {filterList.map((filter) => (
        <Tag key={filter.id} closable onClose={() => removeFilter(filter.id)} color={color} className={styles.filterTag}>
          {filter.label}
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
        placement="bottomLeft"
        overlayStyle={{ padding: 0 }}
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
