import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { createStyles } from "antd-style";
import { useEffect } from "react";
import { create } from "zustand";

export type CollapsedButtonProps = {
  collapsed?: boolean;
};

export type CollapsedButtonStore = {
  collapsed: boolean;
  changeCollapsed: () => void;
};

const useStyles = createStyles(({ token }) => ({
  buttonContainer: {
    padding: token.padding,
  },
  iconContainer: {
    width: "24px",
    height: "24px",
    background: "#f3f3f3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
}));

const createCollapsedStore = (initialCollapsed = false) =>
  create<CollapsedButtonStore>((set, get) => {
    return {
      collapsed: initialCollapsed,
      changeCollapsed: () => {
        const _collapsed = get().collapsed;
        set({
          collapsed: !_collapsed,
        });
      },
    };
  });
  
export const useCollapsedStore = createCollapsedStore(false);

export const CollapsedButton = (props: CollapsedButtonProps) => {
  const { collapsed: defaultCollapsed = false } = props;
  const { styles } = useStyles();

  const { collapsed, changeCollapsed } = useCollapsedStore.getState();

  useEffect(() => {
    if (defaultCollapsed !== useCollapsedStore.getState().collapsed) {
      useCollapsedStore.setState({ collapsed: defaultCollapsed });
    }
  }, [defaultCollapsed]);

  return (
    <div
      className={styles.buttonContainer}
      onClick={() => {
        changeCollapsed();
      }}
    >
      <div className={styles.iconContainer}>
        {collapsed ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
      </div>
    </div>
  );
};
