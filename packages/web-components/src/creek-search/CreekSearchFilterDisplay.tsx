import { DeleteOutlined } from '@ant-design/icons';
import { ParamsType } from '@ant-design/pro-components';
import { Flex, Space, Tag } from 'antd';
import { createStyles } from 'antd-style';
import classNames from 'classnames';

import { useSearchContext } from './CreekSearchContext';
import { CreekSearchFilter } from './type';

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

  clearButtonContainer: {
    marginLeft: token.marginXS,
    borderLeft: `1px solid #EBEDF1`,
    paddingLeft: 8,
  },
  clearTextContainer: {
    color: '#1E2128',
    fontWeight: 500,
    cursor: 'pointer',
  },
}));

export type CreekFilterDisplayProps<T, U, ValueType> = {
  className?: string;
};

export const CreekFilterDisplay = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: CreekFilterDisplayProps<T, U, ValueType>) => {
  const { styles } = useStyles();
  const { filters, removeFilter, handelRest } = useSearchContext<T, U, ValueType>();

  const { className } = props;

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

  return (
    <Flex className={classNames(styles.filtersDisplay, className)} wrap>
      <span>{renderFilterTags(filters)}</span>
      <Space className={styles.clearButtonContainer} align="center" size={4} onClick={handelRest}>
        <DeleteOutlined />
        <span className={styles.clearTextContainer}>清空</span>
      </Space>
    </Flex>
  );
};
