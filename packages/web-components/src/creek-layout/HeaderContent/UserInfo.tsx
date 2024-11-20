import { Avatar, Space } from "antd";
import { createStyles } from "antd-style";

const useStyles = createStyles(({ token }) => ({
  avatarContainer: {
    backgroundColor: token.colorPrimary,
    width: 25,
    height: 25,
  },
}));

export const UserInfo = () => {
  const { styles } = useStyles();
  return (
    <Space size={4} align="center">
      <Avatar className={styles.avatarContainer}>C</Avatar>
      <span>Creek</span>
    </Space>
  );
};
