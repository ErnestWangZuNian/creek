import { SearchOutlined } from '@ant-design/icons';
import { ProFormColumnsType } from '@ant-design/pro-components';
import {
  AutoComplete,
  Button,
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Popover,
  Radio,
  Select,
  Space
} from 'antd';
import { createStyles } from 'antd-style';

import { useSearchContext } from './SearchContext';

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
  searchInput: {
    '& .ant-input': {
      fontSize: token.fontSize,
    },
    '& .ant-input-prefix': {
      color: token.colorTextTertiary,
    },
  },
  valueSelectorContent: {
    marginBottom: token.marginSM,
  },
  valueSelectorActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: token.marginXS,
  },
  verticalStyle: {
    display: 'flex',
    flexDirection: 'column',
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

// 搜索输入框组件
const SearchInput = () => {
  const { styles } = useStyles();
  const {
    searchValue,
    filterOptions,
    inputRef,
    setSearchValue,
    handleSearch,
    handleSelectColumn,
  } = useSearchContext();

  // AutoComplete 选项
  const autoCompleteOptions = filterOptions?.map((option) => ({
    value: option.dataIndex,
    label: option.title,
  }));

  return (
    <AutoComplete
      ref={inputRef}
      className={styles.autoCompleteContainer}
      options={autoCompleteOptions}
      onSearch={setSearchValue}
      onSelect={handleSelectColumn}
      value={searchValue}
      allowClear
    >
      <Input
        placeholder="添加筛选条件"
        prefix={<SearchOutlined />}
        onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
        className={styles.searchInput}
      />
    </AutoComplete>
  );
};

// 值选择器组件
const ValueSelector = () => {
  const { styles } = useStyles();
  const {
    selectedColumn,
    tempValue,
    setTempValue,
    confirmAddFilter,
    getColumnOptions,
    hasOptions,
  } = useSearchContext();

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
          selectorContent = (
            <Radio.Group
              className={styles.verticalStyle}
              {...fieldProps}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              options={options}
            />
          );
          break;
        case 'checkbox':
          selectorContent = (
            <Checkbox.Group
              className={styles.verticalStyle}
              {...fieldProps}
              value={tempValue}
              onChange={(value) => setTempValue(value)}
              options={options}
            />
          );
          break;
        case 'select':
          selectorContent = (
            <Select
              {...fieldProps}
              placeholder="请选择"
              value={tempValue}
              onChange={setTempValue}
              options={options}
              showSearch
              style={{ width: '100%' }}
            />
          );
          break;
      }
    } else {
      // 根据 valueType 渲染对应的组件
      switch (valueType) {
        case 'date':
          selectorContent = (
            <DatePicker
              placeholder="请选择日期"
              value={tempValue}
              onChange={setTempValue}
              style={{ width: '100%' }}
            />
          );
          break;

        case 'dateRange':
          selectorContent = (
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              value={tempValue}
              onChange={setTempValue}
              style={{ width: '100%' }}
            />
          );
          break;

        case 'digit':
        case 'money':
          selectorContent = (
            <InputNumber
              placeholder="请输入数字"
              value={tempValue}
              onChange={setTempValue}
              style={{ width: '100%' }}
            />
          );
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
          selectorContent = (
            <Input
              placeholder="请输入值"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              style={{ width: '100%' }}
            />
          );
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

  return renderValueSelectorContent();
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
        <SearchInput />
      </Popover>
    </div>
  );
};