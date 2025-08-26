import { Divider, Flex, Space } from 'antd';
import { createStyles } from 'antd-style';

import { FullScreen } from './FullScreen';
import { UserInfo } from './UserInfo';

const useStyles = createStyles(({}) => ({
  dividerContainer: {
    backgroundColor: '#9b9999',
  },
}));

export const HeaderContent = () => {
  const { styles } = useStyles();
  return (
    <Flex justify="space-between">
      <span />
      <Space split={<Divider type="vertical" className={styles.dividerContainer} />}>
        <FullScreen />
        <UserInfo />
      </Space>
    </Flex>
  );
};
