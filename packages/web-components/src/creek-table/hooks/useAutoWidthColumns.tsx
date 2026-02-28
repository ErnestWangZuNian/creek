import { ProColumns } from '@ant-design/pro-components';
import { useMemoizedFn } from 'ahooks';
import { Space } from 'antd';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_PADDING_WIDTH_SMALL = 16; // small size (compact)
const DEFAULT_PADDING_WIDTH_LARGE = 24; // large size (default)

/**
 * 估算字符串宽度（简单估算：汉字 14px，非汉字 8px）
 */
const estimateWidth = (text: string, padding: number) => {
  let width = 0;
  for (const char of text) {
    if (/[\u4e00-\u9fa5]/.test(char)) {
      width += 14;
    } else {
      width += 8;
    }
  }
  return width + padding;
};

/**
 * 根据 valueType 获取默认宽度
 */
const getValueTypeWidth = (valueType: string | undefined): number => {
  switch (valueType) {
    case 'date':
    case 'dateRange':
      return 120;
    case 'dateTime':
    case 'dateTimeRange':
      return 180;
    case 'time':
    case 'timeRange':
      return 100;
    case 'index':
    case 'indexBorder':
      return 60;
    case 'money':
      return 100;
    case 'digit':
      return 100;
    case 'select':
      return 120;
    default:
      return 80; // 默认给 80
  }
};

/**
 * 一个用于测量的包裹组件
 */
const MeasureWrapper = ({ children, onResize }: { children: React.ReactNode; onResize: (width: number) => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // 初次测量
    onResize(ref.current.offsetWidth);

    // 监听变化
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // 使用 scrollWidth 来获取完整内容宽度，防止被截断时的测量误差
        const width = (entry.target as HTMLElement).scrollWidth;
        onResize(width);
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []); // 依赖为空，只在挂载时设置监听

  // 使用 inline-block 和 nowrap 防止内容被父容器宽度挤压导致测量不准
  return (
    <div
      ref={ref}
      style={{
        display: 'inline-block',
        whiteSpace: 'nowrap',
        width: 'max-content', // 确保宽度由内容决定
        minWidth: 'min-content',
      }}
    >
      <Space>{children}</Space>
    </div>
  );
};

export const useAutoWidthColumns = <T, ValueType>(
  columns: ProColumns<T, ValueType>[] | undefined,
  tableRef: RefObject<HTMLDivElement>,
  resizedWidths?: Record<string, number>,
  bordered?: boolean,
  size?: 'large' | 'middle' | 'small' | 'medium',
): { columns: ProColumns<T, ValueType>[] | undefined; totalWidth: number | undefined } => {
  // 存储每个列的最大宽度：key 是 dataIndex 或 title，value 是最大宽度
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  // 初始时尝试直接获取宽度，如果 tableRef 已经有值
  const [tableWidth, setTableWidth] = useState<number>(() => {
      if (tableRef.current) {
          return tableRef.current.offsetWidth;
      }
      return 0;
  });

  // 监听 table 容器宽度变化
  useEffect(() => {
    if (!tableRef.current) return;
    
    // 如果初始状态是0（因为ref.current可能在render时为null），这里补救一下
    if (tableWidth === 0) {
        setTableWidth(tableRef.current.offsetWidth);
    }

    // 使用 requestAnimationFrame + setTimeout 防抖
    let rafId: number;
    let timerId: NodeJS.Timeout;

    const updateWidth = (width: number) => {
      // 忽略 0 宽度的更新（通常是由于 display: none 引起的）
      if (width === 0) return;

      cancelAnimationFrame(rafId);
      clearTimeout(timerId);

      rafId = requestAnimationFrame(() => {
        timerId = setTimeout(() => {
          setTableWidth(width);
        }, 500);
      });
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateWidth(entry.contentRect.width);
      }
    });

    observer.observe(tableRef.current);

    // 监听 window resize 作为后备
    const handleWindowResize = () => {
      if (tableRef.current) {
        updateWidth(tableRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
    };
  }, [tableRef]);

  const handleResize = useMemoizedFn((key: string, width: number) => {
    setColumnWidths((prev) => {
      const currentMax = prev[key] || 0;
      if (width > currentMax) {
        return { ...prev, [key]: width };
      }
      return prev;
    });
  });

  const { columns: finalColumns, totalWidth } = useMemo(() => {
    if (!columns) return { columns: undefined, totalWidth: undefined };

    // 1. 先计算所有列的理想宽度（不考虑 table 宽度）
    const calculatedColumns = columns.map((col, index) => {
      const colKey = (col.key as string) || (col.dataIndex as string) || `col-${index}`;
      const measuredWidth = columnWidths[colKey];
      
      // 根据 size 确定 padding
      let padding = DEFAULT_PADDING_WIDTH_SMALL;
       if (size === 'large') {
        padding = DEFAULT_PADDING_WIDTH_LARGE;
      }
      
      let baseWidth: number;
      if (col.width) {
        baseWidth = typeof col.width === 'number' ? col.width : 100; // 暂时给个默认值如果手动设了 string width
      } else if (col.valueType === 'option' && measuredWidth) {
        // bordered 模式下，需要额外的宽度来容纳边框和视觉间距，避免换行
        const extraPadding = bordered ? 4: 0;
        baseWidth = measuredWidth + padding + extraPadding;
      } else {
        baseWidth = Math.max(estimateWidth(col.title as string, padding), getValueTypeWidth(col.valueType as string));
      }

      let width = baseWidth;
      if (resizedWidths && resizedWidths[colKey]) {
        width = resizedWidths[colKey];
      }

      return {
        ...col,
        _calculatedWidth: width,
        _baseWidth: baseWidth, // 新增 _baseWidth 用于后续 minWidth 限制
        _colKey: colKey,
      };
    });

    // 2. 计算所有列的总宽度
    const totalCalculatedWidth = calculatedColumns.reduce((acc, col) => acc + col._calculatedWidth, 0);

    // 3. 判断是否需要自适应
    // 如果总宽度小于 table 宽度，说明空间足够，除了 option 列，其他列可以不设宽度让 table 自动撑开
    // 但如果有任何列被用户手动 resize 了，我们认为用户希望精确控制，此时也应该返回 totalWidth
    const hasResized = resizedWidths && Object.keys(resizedWidths).length > 0;
    const isOverflow = totalCalculatedWidth > tableWidth || hasResized;

    // 只有在内容真实溢出（即总宽度 > 容器宽度）时，才强制给未设置宽度的列设置最小估算宽度。
    // 如果仅仅是用户调整了某列宽度但总宽度仍小于容器宽度，此时不应该限制其他列的宽度，
    // 而是利用 table 的自动布局特性让它们填充剩余空间。
    const shouldForceWidth = totalCalculatedWidth > tableWidth;

    const processedColumns = calculatedColumns.map((col) => {
      // 提取内部使用的字段
      const { _calculatedWidth, _baseWidth, _colKey, ...originalCol } = col;

      // 针对 valueType === 'option' (操作列)，始终需要特殊处理（包裹测量组件）
      if (col.valueType === 'option') {
        const originalRender = col.render;
        return {
          ...originalCol,
          // 始终设置 option 列宽度
          width: _calculatedWidth,
          fixed: col.fixed ?? 'right',
          render: (dom: any, entity: any, index: any, action: any, schema: any) => {
            const originalRenderResult = originalRender ? (originalRender(dom, entity, index, action, schema) as React.ReactNode) : dom;
            return <MeasureWrapper onResize={(width) => handleResize(_colKey, width)}>{originalRenderResult}</MeasureWrapper>;
          },
        } as ProColumns<T, ValueType>;
      }

      // 非 option 列
      return {
        ...originalCol,
        // 只有当内容溢出（需要滚动）或者手动设置了宽度时，才应用计算出的宽度
        // 否则不设置 width，让 Antd Table 自动布局占满剩余空间
        width: shouldForceWidth || col.width || (resizedWidths && resizedWidths[_colKey]) ? _calculatedWidth : undefined,
        // 添加 calculatedWidth 以供后续 useResizableColumns 使用，这里使用 _baseWidth (即不受 resize 影响的宽度)
        calculatedWidth: _baseWidth,
        onHeaderCell: (column: any) => {
          const originalProps = originalCol.onHeaderCell ? originalCol.onHeaderCell(column) : {};
          return {
            ...originalProps,
            style: {
              ...originalProps.style,
              minWidth: _calculatedWidth,
            },
          };
        },
        onCell: (record: any, index: any) => {
          const originalProps = originalCol.onCell ? originalCol.onCell(record, index) : {};
          return {
            ...originalProps,
            style: {
              ...originalProps.style,
              minWidth: _calculatedWidth,
            },
          };
        },
      };
    });

    return {
      columns: processedColumns,
      totalWidth: isOverflow ? totalCalculatedWidth : undefined,
    };
  }, [columns, columnWidths, tableWidth, resizedWidths]);

  return {
    columns: finalColumns,
    totalWidth,
  };
};
