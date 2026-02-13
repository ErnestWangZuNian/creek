import { Avatar, Dropdown, DropDownProps, Space } from "antd";
import { createStyles } from "antd-style";

const useStyles = createStyles(({ token}) => ({
  avatarContainer: {
    backgroundColor: token.colorPrimary,
    width: 24,
    height: 24,
  },
  userInfoDropdownOverlay: {
    ".ant-dropdown-menu": {
      padding: "8px 0",
    },
    ".ant-dropdown-menu-item": {
      ".ant-dropdown-menu-item-icon": {
        fontSize: "18px",
        marginRight: "8px",
      },
    },
  },
}));

export interface UserInfoProps {
  name?: React.ReactNode;
  avatar?: string;
  menu?: DropDownProps['menu'];
}

export const UserInfo = (props: UserInfoProps) => {
  const { styles } = useStyles();
  const { name, avatar, menu } = props;

  return (
    <Dropdown arrow placement="bottom" overlayClassName={styles.userInfoDropdownOverlay} menu={menu}>
      <Space size={4} align="center">
        <Avatar className={styles.avatarContainer} src={avatar}>
          {name}
        </Avatar>
        <span>{name}</span>
      </Space>
    </Dropdown>
  );
};
