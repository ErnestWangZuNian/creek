import { CopyOutlined } from '@ant-design/icons';
import { Flex, message, TooltipProps, Typography } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ css, token }) => {
  return {
    text: css`
      width: 100%;
      margin: 0;
      padding: 0;
    `,
    copyIcon: css`
      cursor: pointer;
      color: inherit;
      transition: color 0.2s;
      
      &:hover {
        color: ${token.colorPrimary};
      }
    `,
  };
});

/**
 * 使用 Antd Typography 组件实现省略提示
 */
export const EllipsisTooltip = ({ children }: { children: React.ReactNode }) => {
  const { styles } = useStyles();
  const isSimpleContent = typeof children === 'string' || typeof children === 'number';

  if (!isSimpleContent) {
    return (
      <Typography.Text
        className={styles.text}
        ellipsis={{
          tooltip: true,
        }}
      >
        {children}
      </Typography.Text>
    );
  }

  const text = String(children);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success('复制成功');
      })
      .catch(() => {
        message.error('复制失败');
      });
  };

  const tooltipProps: TooltipProps = {
    title: (
      <Flex align="center" gap={8}>
        <span>{children}</span>
        <CopyOutlined
          onClick={handleCopy}
          className={styles.copyIcon}
          title="复制"
        />
      </Flex>
    ),
    mouseLeaveDelay: 0.2,
  };

  return (
    <Typography.Text
      className={styles.text}
      ellipsis={{
        tooltip: tooltipProps,
      }}
    >
      {children}
    </Typography.Text>
  );
};
