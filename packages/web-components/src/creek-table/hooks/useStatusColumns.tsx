import { ProColumns } from '@ant-design/pro-components';
import { Badge, Tag } from 'antd';
import { get } from 'lodash';
import React, { useMemo } from 'react';

// Preset colors for automatic assignment when no semantic match is found
const PRESET_COLORS = [
  'blue',
  'green',
  'volcano',
  'orange',
  'gold',
  'lime',
  'cyan',
  'geekblue',
  'purple',
  'magenta',
];

// Semantic keywords mapping
const SEMANTIC_STATUS_MAP: Record<string, string> = {
  // Success / Green
  success: 'success',
  ok: 'success',
  pass: 'success',
  complete: 'success',
  finish: 'success',
  online: 'success',
  active: 'success',
  enable: 'success',
  published: 'success',
  open: 'success',
  正常: 'success',
  成功: 'success',
  完成: 'success',
  通过: 'success',
  启用: 'success',
  在线: 'success',
  发布: 'success',
  开启: 'success',
  已发布: 'success',

  // Error / Red
  fail: 'error',
  error: 'error',
  reject: 'error',
  stop: 'error',
  close: 'error',
  offline: 'error',
  disable: 'error',
  banned: 'error',
  exception: 'error',
  blocked: 'error',
  失败: 'error',
  错误: 'error',
  拒绝: 'error',
  停止: 'error',
  关闭: 'error',
  离线: 'error',
  禁用: 'error',
  异常: 'error',
  封禁: 'error',

  // Processing / Blue
  process: 'processing',
  running: 'processing',
  pending: 'processing',
  waiting: 'processing',
  loading: 'processing',
  init: 'processing',
  doing: 'processing',
  进行中: 'processing',
  处理中: 'processing',
  等待: 'processing',
  加载: 'processing',
  初始化: 'processing',
  启动: 'processing',
  运行中: 'processing',

  // Warning / Warning
  warn: 'warning',
  timeout: 'warning',
  expire: 'warning',
  risk: 'warning',
  abnormal: 'warning',
  警告: 'warning',
  超时: 'warning',
  过期: 'warning',
  风险: 'warning',

  // Default
  default: 'default',
  normal: 'default',
  unknown: 'default',
  默认: 'default',
  未知: 'default',
};

// Helper to determine status color based on text or key
const inferStatusColor = (key: string | number, text: string): string => {
  const normalizedKey = String(key).toLowerCase();
  const normalizedText = String(text).toLowerCase();

  // 1. Try to match key first
  for (const keyword in SEMANTIC_STATUS_MAP) {
    if (normalizedKey.includes(keyword)) {
      return SEMANTIC_STATUS_MAP[keyword];
    }
  }

  // 2. Try to match text
  for (const keyword in SEMANTIC_STATUS_MAP) {
    if (normalizedText.includes(keyword)) {
      return SEMANTIC_STATUS_MAP[keyword];
    }
  }

  // 3. Fallback to deterministic hash color
  // Use a simple hash of the key to pick a color from PRESET_COLORS
  let hash = 0;
  for (let i = 0; i < normalizedKey.length; i++) {
    hash = normalizedKey.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PRESET_COLORS.length;
  return PRESET_COLORS[index];
};

export const useStatusColumns = <T, ValueType>(
  columns?: ProColumns<T, ValueType>[],
) => {
  return useMemo(() => {
    return columns?.map((col) => {
      // If user has custom render, we respect it and do nothing
      if (col.render) {
        return col;
      }

      // If no valueEnum, we do nothing
      if (!col.valueEnum) {
        return col;
      }

      // Check fieldProps for explicit status render mode: 'tag' | 'badge' | 'none' | undefined (auto)
      // We use fieldProps because it's a standard place to put custom column props without TS errors
      const statusRender = (col.fieldProps as any)?.statusRender;
    

      if (statusRender === 'none') {
        return col;
      }

      // We wrap the render function to support Tag and Badge automatically based on valueEnum properties
      return {
        ...col,
        render: (
          dom: React.ReactNode,
          entity: T,
          index: number,
          action: any,
          schema: any,
        ) => {
          const valueEnum = schema?.valueEnum;
          if (!valueEnum) {
            return dom;
          }

          // Get raw value
          const dataIndex = col.dataIndex || col.key;
          // dataIndex can be array or string
          const rawValue =
            typeof dataIndex === 'string' || Array.isArray(dataIndex)
              ? get(entity, dataIndex as any)
              : undefined;

          if (rawValue === undefined || rawValue === null) {
            return dom;
          }

          // valueEnum can be Map or Object
          let enumItem = null;
          if (valueEnum instanceof Map) {
            enumItem = valueEnum.get(rawValue);
            // Try string key if number key fails, or vice versa
            if (!enumItem && typeof rawValue === 'number') {
              enumItem = valueEnum.get(String(rawValue));
            } else if (!enumItem && typeof rawValue === 'string') {
              enumItem = valueEnum.get(Number(rawValue));
            }
          } else {
            enumItem = valueEnum[rawValue as string];
          }

          if (!enumItem) {
            return dom;
          }

          // 1. If color is present, render Tag (unless forced to badge)
          if (enumItem.color && statusRender !== 'badge') {
            return (
              <Tag color={enumItem.color} style={{ margin: 0 }}>
                {enumItem.text || dom}
              </Tag>
            );
          }

          // 2. If status is present, render Badge (unless forced to tag)
          // ProTable usually handles this, but since we overrode render, we must handle it
          if (enumItem.status && statusRender !== 'tag') {
            const status = String(enumItem.status).toLowerCase();
            return <Badge status={status as any} text={enumItem.text || dom} />;
          }

          // 3. If neither is present, try to infer color automatically
          // Only infer if it's NOT explicitly set to null/false (in case user wants plain text)
          if (enumItem.status === null || enumItem.status === false) {
            return dom;
          }
          const inferred = inferStatusColor(
            rawValue,
            enumItem.text || String(rawValue),
          );

          // Force Tag mode
          if (statusRender === 'tag') {
             // Map semantic status to actual colors for Tag
            let tagColor = inferred;
            if (inferred === 'processing') tagColor = 'blue';
            if (inferred === 'error') tagColor = 'error';
            if (inferred === 'success') tagColor = 'success';
            if (inferred === 'warning') tagColor = 'warning';
            if (inferred === 'default') tagColor = 'default';

            return (
                <Tag color={tagColor} style={{ margin: 0 }}>
                  {enumItem.text || dom}
                </Tag>
            );
          }

          // Default / Force Badge mode
          // If it is a semantic status, use status prop
          if (['success', 'processing', 'error', 'default', 'warning'].includes(inferred)) {
            return <Badge status={inferred as any} text={enumItem.text || dom} />;
          }

          // Otherwise use color prop (for preset colors like 'volcano', 'gold', etc.)
          return <Badge color={inferred} text={enumItem.text || dom} />;
        },
      } as ProColumns<T, ValueType>;
    });
  }, [columns]);
};
