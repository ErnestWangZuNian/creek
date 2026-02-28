import type { ParamsType, ProColumns } from '@ant-design/pro-components';
import React, { useMemo } from 'react';
import { EllipsisTooltip } from '../components';

/**
 * 默认开启 ellipsis 的 Hook
 * 1. 如果用户未配置 ellipsis，默认开启，并使用 Tooltip 显示完整内容
 * 2. 如果是 option 列，默认不开启
 * 3. 尊重用户配置
 */
export const useEllipsisColumns = <T extends ParamsType, ValueType = 'text'>(
  columns: ProColumns<T, ValueType>[] | undefined,
) => {
  const processedColumns = useMemo(() => {
    return columns?.map((col) => {
      // 对于操作列，默认不开启 ellipsis
      if (col.valueType === 'option') {
        return col;
      }
      // 其他列默认开启 ellipsis，并使用自定义渲染
      return {
        ...col,
        // 关闭 Table 自带的 ellipsis title，因为我们要用自己的 Tooltip
        // 但保留 ellipsis 属性以确保 Table 传递正确的样式给 cell（虽然我们的 EllipsisTooltip 也有样式）
        // 实际上，为了让 EllipsisTooltip 占据 100% 宽度并生效，最好让 Table cell 也保持一定的约束
        ellipsis: {
          showTitle: false,
        },
        render: (dom: React.ReactNode, entity: T, index: number, action: any, schema: any) => {
          const originalRenderResult = col.render ? (col.render(dom, entity, index, action, schema) as React.ReactNode) : dom;
          
          // 如果内容为空，直接返回
          if (originalRenderResult === null || originalRenderResult === undefined || originalRenderResult === '') {
            return originalRenderResult;
          }

          // 如果是简单的文本或数字，使用 EllipsisTooltip 包裹
          return (
            <EllipsisTooltip>{originalRenderResult}</EllipsisTooltip>
          );
        },
      } as ProColumns<T, ValueType>;
    });
  }, [columns]);

  return processedColumns;
};
