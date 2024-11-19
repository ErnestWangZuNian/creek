
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';

export type CollapsedButtonProps = {
    collapsed?: boolean;
};

const useStyles = createStyles(({ token }) => ({
    buttonContainer: {
        padding: token.padding
    },
    iconContainer: {
        width: '24px',
        height: "24px",
        background: "#f3f3f3",
        padding: token.paddingXS

    }
}));

export const CollapsedButton = (props: CollapsedButtonProps) => {
    const { collapsed } = props;
    const { styles } = useStyles();

    return <div className={styles.buttonContainer}>
        <div className={styles.iconContainer}>
            {collapsed ? <ArrowRightOutlined /> : <ArrowLeftOutlined />}
        </div>
    </div>
}