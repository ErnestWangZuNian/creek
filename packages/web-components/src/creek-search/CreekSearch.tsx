import { ParamsType } from '@ant-design/pro-components';

import { createStyles } from 'antd-style';

import { CreekSearchProvider } from './CreekSearchContext';
import { CreekFilterDisplay } from './CreekSearchFilterDisplay';
import { CreekSearchInput } from './CreekSearchInput';

const useStyles = createStyles(({ token }) => {
  return {
    creekSearchContainer: {
      padding: '20px',
      width: '100%',
    },
    creekSearchFilterDisplay: {
      marginTop: '10px',
    },
  };
});

export type CreekSearchProps<T> = {
  columns: T[];
  onSubmit?: (values: Record<string, any>) => void;
};

export const CreekSearch = <T extends ParamsType>(props: CreekSearchProps<T>) => {
  const { columns = [], onSubmit } = props;

  const { styles } = useStyles();

  return (
    <CreekSearchProvider columns={columns} onSubmit={onSubmit}>
      <div className={styles.creekSearchContainer}>
        <CreekSearchInput />
        <CreekFilterDisplay className={styles.creekSearchFilterDisplay} />
      </div>
    </CreekSearchProvider>
  );
};
