import { SearchOutlined } from '@ant-design/icons';
import { AutoComplete, Input, Space, Tag } from 'antd';
import { createStyles } from 'antd-style';
import { useState } from 'react';

// 类型定义
interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select';
}

interface Filter {
  id: number;
  key: string;
  value: string;
  label: string;
}

interface AutoCompleteOption {
  value: string;
  label: string;
}

// 样式定义
const useStyles = createStyles(({ token }) => ({
  searchWrapper: {
    width: 350,
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
  addonAfter: {
    backgroundColor: token.colorBgContainer,
    border: 'none',
    padding: `${token.paddingXXS}px ${token.paddingSM}px`,
  },
}));

export const CustomSearch = () => {
  const { styles } = useStyles();
  const [searchValue, setSearchValue] = useState<string>('');
  const [filters, setFilters] = useState<Filter[]>([]);

  // 筛选条件配置
  const filterOptions: FilterOption[] = [
    { key: 'instanceName', label: '实例名称', type: 'text' },
    { key: 'status', label: '状态', type: 'select' },
    { key: 'zone', label: '可用区', type: 'select' },
    { key: 'tags', label: '标签', type: 'text' },
    { key: 'security', label: '安全', type: 'select' }
  ];

  // 处理搜索输入
  const handleSearch = (value: string): void => {
    // 检测筛选条件格式 "条件名: 值"
    const colonIndex = value.lastIndexOf(':');
    if (colonIndex > 0) {
      const filterType = value.substring(0, colonIndex).trim();
      const filterValue = value.substring(colonIndex + 1).trim();
      
      const matchingFilter = filterOptions.find(f => 
        f.label === filterType || f.key === filterType
      );
      
      if (matchingFilter && filterValue) {
        addFilter(matchingFilter.key, filterValue);
        setSearchValue('');
        return;
      }
    }
    setSearchValue(value);
  };

  // 添加筛选条件
  const addFilter = (key: string, value: string): void => {
    const filterConfig = filterOptions.find(f => f.key === key);
    if (!filterConfig) return;

    const newFilter: Filter = {
      id: Date.now(),
      key,
      value,
      label: `${filterConfig.label}: ${value}`
    };
    
    setFilters(prev => [...prev, newFilter]);
  };

  // 删除筛选条件
  const removeFilter = (filterId: number): void => {
    setFilters(prev => prev.filter(f => f.id !== filterId));
  };

  // AutoComplete 选项
  const autoCompleteOptions: AutoCompleteOption[] = filterOptions.map(option => ({
    value: `${option.label}: `,
    label: option.label
  }));

  // 渲染筛选条件标签
  const renderFilterTags = (filterList: Filter[], color: string = 'blue') => (
    <Space size={4} wrap>
      {filterList.map(filter => (
        <Tag 
          key={filter.id}
          closable
          onClose={() => removeFilter(filter.id)}
          color={color}
          className={styles.filterTag}
        >
          {filter.label}
        </Tag>
      ))}
    </Space>
  );

  return (
    <div className={styles.searchWrapper}>
        <AutoComplete
          style={{ width: '100%' }}
          options={autoCompleteOptions}
          onSearch={setSearchValue}
          onSelect={handleSearch}
          value={searchValue}
          placeholder="添加筛选条件"
          allowClear
        >
          <Input 
            prefix={<SearchOutlined />}
            onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
            className={styles.searchInput}
          />
        </AutoComplete>
        
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

