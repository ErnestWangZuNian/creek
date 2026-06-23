import { CopyOutlined } from '@ant-design/icons';
import { ConfigProvider, Flex, Tooltip, Typography, message } from 'antd';
import { createStyles } from 'antd-style';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { useT } from '@creekjs/i18n/react';

const useStyles = createStyles(({ css, token }) => {
  return {
    text: css`
      max-width: 100%;
      margin: 0;
      padding: 0;
      display: block;
      overflow: hidden;
      // flex: 1 确保在树形表格的 flex 单元格中填充剩余空间（展开图标/层级缩进之后）
      // min-width: 0 允许收缩以配合 Typography.Text 的 ellipsis 截断
      flex: 1;
      min-width: 0;
    `,
    tooltipContent: css`
      max-width: 500px;
      max-height: 300px;
      overflow-y: auto;
    `,
    tooltipText: css`
      word-break: break-all;
      white-space: pre-wrap;
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
 * 修复了 findDOMNode 警告问题：通过显式使用 Tooltip 包裹 div 容器
 * 实现了智能提示：只有内容实际溢出时才显示 Tooltip
 */
export const EllipsisTooltip = ({ children }: { children: React.ReactNode }) => {
  const t = useT();

  const { styles } = useStyles();
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const textRef = useRef<HTMLDivElement>(null);
  const [isEllipsis, setIsEllipsis] = useState(false);
  const isSimpleContent = typeof children === 'string' || typeof children === 'number';

  useEffect(() => {
    const checkEllipsis = () => {
      if (textRef.current) {
        const prefixCls = getPrefixCls('typography');
        // Typography.Text renders a span or div with .ant-typography
        const typographyEl = textRef.current.querySelector(`.${prefixCls}`);
        if (typographyEl) {
          // For simple ellipsis={true}, Antd uses CSS ellipsis.
          // We can detect if it's truncated by comparing scrollWidth and clientWidth
          // We add a small buffer (1px) for browser sub-pixel rendering differences
          setIsEllipsis(typographyEl.scrollWidth > typographyEl.clientWidth + 1);
        }
      }
    };

    // Initial check
    checkEllipsis();
    // Use ResizeObserver for more robust size change detection
    const observer = new ResizeObserver(checkEllipsis);
    if (textRef.current) {
      observer.observe(textRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [children]);

  const text = String(children);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard
      .writeText(text)
      .then(() => {
        message.success(t('creek-table.components.EllipsisTooltip.fuZhiChengGong', '复制成功'));
      })
      .catch(() => {
        message.error(t('creek-table.components.EllipsisTooltip.fuZhiShiBai', '复制失败'));
      });
  };

  // Memoize tooltip title content
  const tooltipTitle = React.useMemo(() => {
    if (!isSimpleContent) {
      return children;
    }
    return (
      <Flex align="center" gap={8} className={styles.tooltipContent}>
        <span className={styles.tooltipText}>{children}</span>
        <CopyOutlined onClick={handleCopy} className={styles.copyIcon} title={t('creek-table.components.EllipsisTooltip.fuZhi', '复制')} />
      </Flex>
    );
  }, [children, isSimpleContent]);

  return (
    <Tooltip title={isEllipsis ? tooltipTitle : undefined} placement="topLeft" mouseLeaveDelay={0.2} getPopupContainer={() => document.body}>
      <div ref={textRef} className={styles.text}>
        <Typography.Text ellipsis={true}>{children}</Typography.Text>
      </div>
    </Tooltip>
  );
};
