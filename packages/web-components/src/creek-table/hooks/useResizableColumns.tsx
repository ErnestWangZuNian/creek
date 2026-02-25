import { ProColumns } from '@ant-design/pro-components';
import { useMemoizedFn } from 'ahooks';
import { createStyles } from 'antd-style';
import classnames from 'classnames';
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Resizable, ResizeCallbackData } from 'react-resizable';

interface ResizableTitleProps extends React.HTMLAttributes<HTMLTableCellElement> {
  onResize?: (e: React.SyntheticEvent, data: ResizeCallbackData) => void;
  onResizeStart?: (e: React.SyntheticEvent, data: ResizeCallbackData) => void;
  width?: number | string;
  minWidth?: number;
}

// 样式定义
const useStyles = createStyles(({ token }) => ({
  'resizable-handle': {
    position: 'absolute',
    right: -5,
    bottom: 0,
    zIndex: 10,
    width: 10,
    height: '100%',
    cursor: 'col-resize',
    touchAction: 'none',
    userSelect: 'none',
    
    // 添加一个小竖线作为视觉提示
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: '50%',
      width: 1,
      opacity: 0,
      transition: 'all 0.3s',
      transform: 'translateX(-50%)',
    },

    '&:hover::after': {
      opacity: 1,
    },

    '&:active::after': {
      opacity: 1,
    },
  },
  'resizable-th': {
    position: 'relative',
    '&:hover .resizable-handle::after': {
      opacity: 0.5,
    },
  },
}));

const ResizableTitle = (props: ResizableTitleProps) => {
  const { onResize, onResizeStart, width, className, minWidth, ...restProps } = props;
  const { styles } = useStyles();

  // 2. 如果 width 不是数字，尝试测量（降级处理）
  const ref = useRef<HTMLTableCellElement>(null);
  const [realWidth, setRealWidth] = useState<number | undefined>(undefined);

  // 本地状态，用于控制拖动过程中的平滑更新
  // 初始化为 props.width (如果是数字) 或 undefined
  const [localWidth, setLocalWidth] = useState<number | undefined>(typeof width === 'number' ? width : undefined);
  const [isResizing, setIsResizing] = useState(false);

  // 当外部 width 变化且非拖动状态时，同步到内部
  useEffect(() => {
    if (!isResizing && typeof width === 'number') {
      setLocalWidth(width);
    }
  }, [width, isResizing]);

  useLayoutEffect(() => {
    if (ref.current) {
      const w = ref.current.getBoundingClientRect().width;
      setRealWidth(w);
      // 如果没有传入具体数字宽度，初始化 localWidth 为测量值
      if (typeof width !== 'number') {
        setLocalWidth(w);
      }
    }
  }, []); // 只在挂载时测量一次

  const handleResizeStart = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
    setIsResizing(true);
    // 增加全局样式防止选中文字
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    if (onResizeStart) {
      onResizeStart(e, data);
    }
  };

  const handleResizeStop = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    // 拖动结束时，确保最后一次更新传递出去
    if (onResize) {
      onResize(e, data);
    }
  };

  const handleResize = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
    // 1. 立即更新本地状态，保证 handle 跟手
    setLocalWidth(data.size.width);
    
    // 2. 调用外部 onResize (可能会被节流)
    if (onResize) {
      onResize(e, data);
    }
  };

  // 1. 如果 width 是数字，直接使用，避免任何 state/effect 开销
  // 修改逻辑：只要有 localWidth 就使用 Resizable
  const currentWidth = localWidth ?? realWidth;

  if (typeof currentWidth === 'number' && onResize) {
    return (
      <Resizable
        width={currentWidth}
        height={0}
        minConstraints={[minWidth || 0, 0]}
        handle={
          <span
            className={classnames(styles['resizable-handle'], 'resizable-handle')}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        }
        onResize={handleResize}
        onResizeStart={handleResizeStart}
        onResizeStop={handleResizeStop}
        draggableOpts={{ enableUserSelectHack: false }} // 我们自己处理了 userSelect
        axis="x"
      >
        <th {...restProps} className={classnames(className, styles['resizable-th'])} style={{ ...restProps.style, width: currentWidth }} />
      </Resizable>
    );
  }

  if (!onResize || !realWidth) {
    return <th {...restProps} className={className} ref={ref} />;
  }

  // Fallback (虽然逻辑上可能不需要了，保留以防万一)
  return (
    <Resizable
      width={realWidth}
      height={0}
      minConstraints={[minWidth || 0, 0]}
      handle={
        <span
          className={classnames(styles['resizable-handle'], 'resizable-handle')}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      }
      onResize={handleResize}
      onResizeStart={handleResizeStart}
      onResizeStop={handleResizeStop}
      draggableOpts={{ enableUserSelectHack: false }}
      axis="x"
    >
      <th {...restProps} className={classnames(className, styles['resizable-th'])} style={{ ...restProps.style, width: realWidth }} />
    </Resizable>
  );
};

export const useResizableColumns = <T, ValueType>(
  columns: ProColumns<T, ValueType>[] | undefined,
  resizable: boolean = true,
  resizedWidthsProp?: Record<string, number>,
  setResizedWidthsProp?: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  tableRef?: React.RefObject<HTMLDivElement>,
): { 
  columns: ProColumns<T, ValueType>[] | undefined;
  components: { header: { cell: React.ComponentType<ResizableTitleProps> } } | undefined;
  resizedWidths: Record<string, number>;
} => {
  // 存储用户手动调整的列宽
  const [internalResizedWidths, setInternalResizedWidths] = useState<Record<string, number>>({});
  // 存储列的初始自动计算宽度，作为最小宽度限制
  const [minWidths, setMinWidths] = useState<Record<string, number>>({});

  const resizedWidths = resizedWidthsProp || internalResizedWidths;
  const setResizedWidths = setResizedWidthsProp || setInternalResizedWidths;

  const rafRef = useRef<Record<string, number>>({});

  // 组件卸载时清理 RAF
  useEffect(() => {
    return () => {
      Object.values(rafRef.current).forEach(cancelAnimationFrame);
    };
  }, []);

  const handleResize = useMemoizedFn((key: string) => (_: React.SyntheticEvent, { size }: ResizeCallbackData) => {
    // 节流逻辑：如果有 pending 的更新，先取消
    if (rafRef.current[key]) {
      cancelAnimationFrame(rafRef.current[key]);
    }

    rafRef.current[key] = requestAnimationFrame(() => {
      setResizedWidths((prev) => {
        // 如果宽度没有变化，不更新状态
        if (prev[key] === size.width) return prev;
        return {
          ...prev,
          [key]: size.width,
        };
      });
      delete rafRef.current[key];
    });
  });

  const handleResizeStart = useMemoizedFn(() => {
    // 只有当 tableRef 存在时才能获取当前宽度
    if (!tableRef?.current) return;

    // 查找所有表头单元格
    const thElements = tableRef.current.querySelectorAll('th[data-column-key]');
    if (!thElements || thElements.length === 0) return;

    const currentWidths: Record<string, number> = {};
    thElements.forEach((th) => {
      const key = th.getAttribute('data-column-key');
      const width = th.getBoundingClientRect().width;
      if (key && width) {
        currentWidths[key] = width;
      }
    });

    setResizedWidths((prev) => {
      // 只有当之前的状态中缺少某些列的宽度时，才合并当前宽度
      // 这样可以避免覆盖用户已经调整过的值，同时填补未调整列的宽度
      // 实际上，我们希望一旦开始 resize，所有列都有明确的宽度
      const next = { ...currentWidths, ...prev };
      
      // 简单的浅比较，如果内容没变就不更新，避免重渲染
      const isSame = Object.keys(next).every(k => next[k] === prev[k]) && Object.keys(prev).length === Object.keys(next).length;
      if (isSame) return prev;

      return next;
    });

    // 记录初始宽度作为 minWidth
    setMinWidths((prev) => {
      const next = { ...prev };
      let hasChange = false;
      Object.keys(currentWidths).forEach((key) => {
        // 只有当没有记录该列的最小宽度时才记录
        // 这样可以确保 minWidth 始终是第一次捕获时的宽度（即 auto 宽度）
        if (next[key] === undefined) {
          next[key] = currentWidths[key];
          hasChange = true;
        }
      });
      return hasChange ? next : prev;
    });
  });

  const resizableColumns = useMemo(() => {
    if (!resizable || !columns) return columns;

    return columns.map((col, index) => {
      // 优先使用 key，如果没有则使用 dataIndex，如果都没有则使用 index
      const key = (col.key as string) || (col.dataIndex as string) || `col-${index}`;
      
      // 针对 valueType 为 'option' 的操作列，不启用 resizing
      if (col.valueType === 'option') {
        return col;
      }
      
      // 只有当存在 resizedWidths[key] 时才使用它，否则完全依赖外部传入的 col.width（即 useAutoWidthColumns 计算出的宽度）
      const width = resizedWidths[key] ?? col.width;

      // 从 col 中获取 calculatedWidth 作为 minWidth
      const calculatedMinWidth = (col as any).calculatedWidth || 0;
      // 使用捕获到的 auto 宽度作为最小宽度，如果没有则使用 0
      const autoMinWidth = minWidths[key] || 0;
      
      // 最终的 minWidth 取两者的最大值，确保至少是 auto 宽度
      const minWidth = Math.max(calculatedMinWidth, autoMinWidth);

      return {
        ...col,
        width, // 应用调整后的宽度
        onHeaderCell: (column: any) => ({
          width: width, // 传递给 ResizableTitle
          minWidth: minWidth,
          onResize: handleResize(key),
          onResizeStart: handleResizeStart,
          'data-column-key': key, // 用于在 DOM 中查找
          ...(col.onHeaderCell ? col.onHeaderCell(column) : null),
        }) as React.HTMLAttributes<HTMLElement>,
      };
    });
  }, [columns, resizable, resizedWidths, handleResize]);

  const components = useMemo(() => {
    if (!resizable) return undefined;

    return {
      header: {
        cell: ResizableTitle,
      },
    };
  }, [resizable]);

  return {
    columns: resizableColumns,
    components,
    resizedWidths,
  };
};
