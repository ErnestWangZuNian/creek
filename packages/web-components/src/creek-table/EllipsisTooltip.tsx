import { CopyOutlined } from '@ant-design/icons';
import { Typography, message } from 'antd';
import React from 'react';

/**
 * 使用 Antd Typography 组件实现省略提示
 */
export const EllipsisTooltip = ({ children }: { children: React.ReactNode }) => {
  const isSimpleContent = typeof children === 'string' || typeof children === 'number';

  if (!isSimpleContent) {
    return (
      <Typography.Text
        style={{
          width: '100%',
          margin: 0,
          padding: 0,
        }}
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

  return (
    <Typography.Text
      style={{
        width: '100%',
        margin: 0,
        padding: 0,
      }}
      ellipsis={{
        tooltip: {
          title: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{children}</span>
              <CopyOutlined
                onClick={handleCopy}
                style={{ cursor: 'pointer', color: 'inherit' }}
                title="复制"
              />
            </div>
          ),
          mouseLeaveDelay: 0.2,
        } as any,
      }}
    >
      {children}
    </Typography.Text>
  );
};
