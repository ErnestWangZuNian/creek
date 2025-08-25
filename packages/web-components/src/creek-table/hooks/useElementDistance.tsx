import { useDebounceFn, useEventListener, useLatest } from 'ahooks';
import { useEffect, useState } from 'react';

type ElementRef = React.RefObject<HTMLElement>;

interface Position {
  left: number;
  width: number;
}

interface Distance {
  x: number;
}

const getElementCenter = (element: HTMLElement): Position => {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    width: rect.width,
  };
};

const calculateDistance = (pos1: Position, pos2: Position): Distance => {
  const x = Math.abs(pos2.left - pos1.left - pos1.width);
  return { x };
};

export const useElementDistance = (element1Ref: ElementRef, element2Ref: ElementRef): Distance | null => {
  const [distance, setDistance] = useState<Distance | null>(null);
  const distanceRef = useLatest(distance);

  const { run: calculateAndUpdateDistance } = useDebounceFn(
    () => {
      if (!element1Ref.current || !element2Ref.current) {
        if (distanceRef.current !== null) {
          setDistance(null);
        }
        return;
      }

      const pos1 = getElementCenter(element1Ref.current);
      const pos2 = getElementCenter(element2Ref.current);
      const newDistance = calculateDistance(pos1, pos2);

      // 只有当距离发生变化时才更新，避免不必要的重渲染
      if (!distanceRef.current || distanceRef.current.x !== newDistance.x) {
        setDistance(newDistance);
      }
    },
    {
      wait: 100,
    },
  );

  // 初始计算
  useEffect(() => {
    calculateAndUpdateDistance();
  }, [element1Ref, element2Ref]);

  // 监听 window 的 resize 和 scroll 事件
  useEventListener('resize', calculateAndUpdateDistance, { target: window });

  return distance;
};
