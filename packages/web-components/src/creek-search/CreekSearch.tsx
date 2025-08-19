import { ParamsType } from '@ant-design/pro-components';
import { createStyles } from 'antd-style';
import classnames from 'classnames';

import { CreekSearchProvider } from './CreekSearchContext';
import { CreekFilterDisplay } from './CreekSearchFilterDisplay';
import { CreekSearchInput } from './CreekSearchInput';

const useStyles = createStyles(
  (
    { token, prefixCls },
    props: {
      justify: 'start' | 'end';
    },
  ) => {
    return {
      creekSearchContainer: {
        padding: '20px 20px 0 20px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: props.justify === 'end' ? 'flex-end' : 'flex-start',
      },

      creekSearchContainerEnd: {
        [`& .${prefixCls}-tag`]: {
          marginInlineEnd: 0,
        },
      },

      creekSearchFilterDisplay: {
        marginTop: '10px',
      },
    };
  },
);

export type CreekSearchProps<T> = {
  columns: T[];
  onSubmit?: (values: Record<string, any>) => void;
  justify?: 'start' | 'end';
};

export const CreekSearch = <T extends ParamsType>(props: CreekSearchProps<T>) => {
  const { columns = [], onSubmit, justify = 'start' } = props;

  const { styles } = useStyles({
    justify,
  });

  return (
    <CreekSearchProvider columns={columns} onSubmit={onSubmit}>
      <div className={classnames(styles.creekSearchContainer, justify === 'end' && styles.creekSearchContainerEnd)}>
        <CreekSearchInput />
        <CreekFilterDisplay className={styles.creekSearchFilterDisplay} />
      </div>
    </CreekSearchProvider>
  );
};
