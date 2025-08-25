import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { useElementDistance } from './useElementDistance';

export const useAdaptiveToolBar = (options: {
  containerRef: MutableRefObject<HTMLElement | null>;
  prefixCls: string;
  minLeftDistance?: number;
  hysteresis?: number; // 滞回差值
}) => {
  const element1Ref = useRef<HTMLElement>(null) as MutableRefObject<HTMLElement | null>;
  const element2Ref = useRef<HTMLElement>(null) as MutableRefObject<HTMLElement | null>;
  const [shouldCollapse, setShouldCollapse] = useState(false);

  const { containerRef, prefixCls, minLeftDistance = 48, hysteresis = 36 } = options;

  useEffect(() => {
    element1Ref.current = containerRef?.current?.querySelector(`.${prefixCls}-pro-table-list-toolbar-left`) || null;
    element2Ref.current = containerRef?.current?.querySelector(`.${prefixCls}-pro-table-list-toolbar-right`)?.querySelector('div') || null;
  });

  const distance = useElementDistance(element1Ref, element2Ref);

  // 方案一：使用滞回逻辑防止震荡
  useEffect(() => {
    if (!distance?.x) return;

    const currentDistance = distance.x;

    if (shouldCollapse) {
      // 当前是折叠状态，需要距离足够大才展开
      if (currentDistance > minLeftDistance + hysteresis) {
        setShouldCollapse(false);
      }
    } else {
      // 当前是展开状态，距离小于阈值时折叠
      if (currentDistance < minLeftDistance) {
        setShouldCollapse(true);
      }
    }
  }, [distance?.x, minLeftDistance, hysteresis, shouldCollapse]);

  return {
    shouldCollapse,
  };
};
