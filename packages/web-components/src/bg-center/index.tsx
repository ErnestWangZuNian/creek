import { createStyles } from 'antd-style';

export type BgCenterProps = {
  children: React.ReactNode;
};

export const BgCenter = ({ children }: BgCenterProps) => {
  const useStyles = createStyles(({ token }) => ({
    bgCenterContianer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      zIndex: token.zIndexBase,
    },
  }));

  const { styles } = useStyles();

  return <div className={styles.bgCenterContianer}>{children}</div>;
};
