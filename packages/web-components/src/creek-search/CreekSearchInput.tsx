import { SearchOutlined } from '@ant-design/icons';
import { AutoComplete, Input, Popover } from 'antd';
import { createStyles } from 'antd-style';
import classNames from 'classnames';

import { useSearchContext } from './CreekSearchContext';
import { CreekSearchValueSelector } from './CreekSearchValueSelector';

const useStyles = createStyles(({ token, prefixCls }) => {

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

export type CreekSearchInputProps = {
  className?: string;
};
// 主搜索输入组件
export const CreekSearchInput = (props: CreekSearchInputProps) => {
  const { className } = props;
  const { styles } = useStyles();
  const { showValueSelector, cancelValueSelector } = useSearchContext();

  return (
    <div className={classNames(styles.searchWrapper, className)}>
      <Popover
        content={<CreekSearchValueSelector />}
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
