import { Divider, Flex, Space } from "antd";
import { createStyles } from "antd-style";

import { FullScreen } from "./FullScreen";
import { UserInfo } from "./UserInfo";

const useStyles = createStyles(({}) => ({
  headerContentContainer: {
    color: "#fff",
  },
  dividerContainer: {
    backgroundColor: "#9b9999",
  },
}));

export const HeaderContent = () => {
  const { styles } = useStyles();
  return (
    <Flex justify="space-between" className={styles.headerContentContainer}>
      <span />
      <Space
        split={<Divider type="vertical" className={styles.dividerContainer} />}
      >
        <FullScreen />
        <UserInfo />
      </Space>
    </Flex>
  );
};
