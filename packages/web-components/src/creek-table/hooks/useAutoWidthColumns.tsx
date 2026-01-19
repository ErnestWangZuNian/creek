import { ProColumns } from '@ant-design/pro-components';
import { useMemoizedFn } from 'ahooks';
import { Space } from 'antd';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_PADDING_WIDTH = 16;

/**
 * 估算字符串宽度（简单估算：汉字 14px，非汉字 8px，左右 padding 16px）
 */
const estimateWidth = (text: string) => {
  let width = 0;
  for (const char of text) {
    if (/[\u4e00-\u9fa5]/.test(char)) {
      width += 14;
    } else {
      width += 8;
    }
  }
  return width + DEFAULT_PADDING_WIDTH; // padding
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
        onResize((entry.target as HTMLElement).offsetWidth);
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, []); // 依赖为空，只在挂载时设置监听

  return <Space ref={ref}>{children}</Space>;
};

export const useAutoWidthColumns = <T, ValueType>(
  columns: ProColumns<T, ValueType>[] | undefined,
  tableRef: RefObject<HTMLDivElement>,
): { columns: ProColumns<T, ValueType>[] | undefined; totalWidth: number | undefined } => {
  // 存储每个列的最大宽度：key 是 dataIndex 或 title，value 是最大宽度
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [tableWidth, setTableWidth] = useState<number>(0);

  // 监听 table 容器宽度变化
  useEffect(() => {
    if (!tableRef.current) return;

    // 立即获取一次宽度
    setTableWidth(tableRef.current.offsetWidth);

    // 使用 requestAnimationFrame + setTimeout 防抖
    let rafId: number;
    let timerId: NodeJS.Timeout;

    const updateWidth = (width: number) => {
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
      const colKey = (col.dataIndex as string) || (col.key as string) || `col-${index}`;
      const measuredWidth = columnWidths[colKey];
      let width: number;
      if (col.width) {
        width = typeof col.width === 'number' ? col.width : 100; // 暂时给个默认值如果手动设了 string width
      } else if (col.valueType === 'option' && measuredWidth) {
        width = measuredWidth + DEFAULT_PADDING_WIDTH;
      } else {
        width = Math.max(estimateWidth(col.title as string), getValueTypeWidth(col.valueType as string));
      }

      return {
        ...col,
        _calculatedWidth: width,
        _colKey: colKey,
      };
    });

    // 2. 计算所有列的总宽度
    const totalCalculatedWidth = calculatedColumns.reduce((acc, col) => acc + col._calculatedWidth, 0);

    // 3. 判断是否需要自适应
    // 如果总宽度小于 table 宽度，说明空间足够，除了 option 列，其他列可以不设宽度让 table 自动撑开
    const isOverflow = totalCalculatedWidth > tableWidth;

    const processedColumns = calculatedColumns.map((col) => {
      // 提取内部使用的字段
      const { _calculatedWidth, _colKey, ...originalCol } = col;

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
        width: isOverflow || col.width ? _calculatedWidth : undefined,
      };
    });

    console.log(processedColumns, 'processedColumns');

    return {
      columns: processedColumns,
      totalWidth: isOverflow ? totalCalculatedWidth : undefined,
    };
  }, [columns, columnWidths, tableWidth]);

  return {
    columns: finalColumns,
    totalWidth,
  };
};
