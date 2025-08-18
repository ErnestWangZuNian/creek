import { ParamsType } from '@ant-design/pro-components';
import { Space, Tag } from 'antd';
import { createStyles } from 'antd-style';

import { CreekSearchFilter } from '../type';
import { useSearchContext } from './SearchContext';

// 样式定义
const useStyles = createStyles(({ token }) => ({
  filtersDisplay: {
    padding: `0 0 ${token.padding}px`,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: token.marginXS,
  },
  filterTag: {
    borderRadius: token.borderRadiusSM,
    fontSize: token.fontSizeSM,
    backgroundColor: '#f2f3f5',
    padding: `2px 12px 2px 8px`,
  },

  filterTagTitle: {
    color: '#81838A',
  },

  filterTagValue: {
    color: '#42464E',
  },
}));

export const FilterDisplay = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>() => {
  const { styles } = useStyles();
  const { filters, removeFilter } = useSearchContext<T, U, ValueType>();

  // 渲染筛选条件标签
  const renderFilterTags = (filterList: CreekSearchFilter[]) => (
    <Space size={4} wrap>
      {filterList?.map((filter) => (
        <Tag key={filter.dataIndex as string} closable onClose={() => removeFilter(filter.dataIndex as string)} className={styles.filterTag}>
          <span className={styles.filterTagTitle}> {filter.title as string}:</span>
          <span className={styles.filterTagValue}> {filter.displayText}</span>
        </Tag>
      ))}
    </Space>
  );

  // 如果没有筛选条件，不渲染
  if (!filters || filters.length === 0) {
    return null;
  }

  return <div className={styles.filtersDisplay}>{renderFilterTags(filters)}</div>;
};
