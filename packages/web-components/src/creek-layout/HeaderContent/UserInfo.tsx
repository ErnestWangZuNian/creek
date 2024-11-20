import { LogoutOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, DropDownProps, Space } from "antd";
import { createStyles } from "antd-style";

const useStyles = createStyles(({ token }) => ({
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

export const UserInfo = () => {
  const { styles } = useStyles();

  const userInfoMenu: DropDownProps["menu"] = {
    items: [
      {
        key: "logout",
        label: (
          <Space size={8}>
            <LogoutOutlined />
            <span>退出登录</span>
          </Space>
        ),
        onClick: () => {},
      },
    ],
  };
  return (
    <Dropdown
      arrow
      placement="bottom"
      overlayClassName={styles.userInfoDropdownOverlay}
      menu={userInfoMenu}
    >
      <Space size={4} align="center">
        <Avatar className={styles.avatarContainer}>C</Avatar>
        <span>Creek</span>
      </Space>
    </Dropdown>
  );
};
