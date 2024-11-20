import { Divider, Flex, Space } from "antd";
import { createStyles } from "antd-style";

import { FullScreen } from "./FullScreen";

const useStyles = createStyles(({ token }) => ({
  headerContentContainer: {
    color: "#fff",
  },
}));

export const HeaderContent = () => {
  const { styles } = useStyles();
  return (
    <Flex justify="space-between" className={styles.headerContentContainer}>
      <span />
      <Space split={<Divider type="vertical" />}>
        <FullScreen />
      </Space>
    </Flex>
  );
};
