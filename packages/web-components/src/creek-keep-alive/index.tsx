import { useMemoizedFn } from 'ahooks';
import { Dropdown, MenuProps, Tabs } from 'antd';
import { isRegExp, isString, omit } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';

import { useT } from '@creekjs/i18n/react';

export interface CreekKeepAliveProps {
  /**
   * 不需要缓存的路径
   */
  exclude?: (string | RegExp)[];
  /**
   * 自定义Tab标题获取方法
   */
  getTabTitle?: (pathname: string) => React.ReactNode;
  /**
   * Tabs的样式
   */
  tabBarStyle?: React.CSSProperties;
  /**
   * 最大缓存数量，默认为 20
   */
  maxTabCount?: number;
}

interface TabItem {
  key: string;
  label: React.ReactNode;
  closable?: boolean;
}

export const CreekKeepAlive: React.FC<CreekKeepAliveProps> = (props) => {
  const { exclude = [], getTabTitle, tabBarStyle, maxTabCount = 20 } = props;

  const t = useT();
  const outlet = useOutlet();
  const location = useLocation();
  const navigate = useNavigate();

  const [tabItems, setTabItems] = useState<TabItem[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');
  const [cachedPages, setCachedPages] = useState<Record<string, React.ReactNode>>({});

  // 用 ref 存储 outlet，避免 outlet 引用变化导致 useEffect 无限循环
  const outletRef = useRef(outlet);
  outletRef.current = outlet;

  // 判断是否不需要缓存
  const isPathExcluded = (path: string) => {
    return exclude.some((item) => {
      if (isString(item)) {
        return item === path;
      }
      if (isRegExp(item)) {
        return item.test(path);
      }
      return false;
    });
  };

  // 初始化或路由变化时更新
  useEffect(() => {
    const currentPath = location.pathname;
    setActiveKey(currentPath);

    // 更新页面内容缓存
    setCachedPages((prev) => {
      if (prev[currentPath]) {
        return prev;
      }
      return {
        ...prev,
        [currentPath]: outletRef.current,
      };
    });

    // 更新 Tab 列表
    setTabItems((prev) => {
      if (prev.find((i) => i.key === currentPath)) {
        // 更新现有 tab 的 closable 状态（只有最后一个 tab 时不可关闭）
        const updated = prev.map((i) => ({ ...i, closable: prev.length > 1 }));
        return updated;
      }
      const title = getTabTitle?.(currentPath) || currentPath;
      const newItems = [...prev, { key: currentPath, label: title, closable: prev.length > 0 }];

      // 更新所有 tab 的 closable 状态：只有1个 tab 时全部不可关闭
      if (newItems.length === 1) {
        newItems[0].closable = false;
      }

      // 超过最大数量限制
      if (newItems.length > maxTabCount) {
        // 找到第一个可以关闭的 Tab（非首页、非当前页）
        // 这里策略是移除最早加入的那个可关闭 Tab。prev[0] 是最早的。
        // 但要注意不要移除当前页（currentPath），虽然 currentPath 是刚加进去的，但在极端情况下（比如 max=1）
        // 简单策略：移除第一个 closable 且 key !== currentPath 的 item
        const indexToRemove = newItems.findIndex((item) => item.closable && item.key !== currentPath);
        if (indexToRemove !== -1) {
          const itemToRemove = newItems[indexToRemove];
          // 顺便移除缓存
          setCachedPages((currentCached) => omit(currentCached, [itemToRemove.key]));
          newItems.splice(indexToRemove, 1);
        }
      }
      return newItems;
    });
  }, [location.pathname, getTabTitle, maxTabCount]);

  // 清理不需要缓存的页面
  useEffect(() => {
    // 监听路由离开
    // 这里比较 tricky，因为 useEffect 拿到的 activeKey 已经是新的了
    // 我们需要知道"上一个"路径
    // 简化处理：每次 render 时，检查 pages 里哪些是不需要缓存且不处于 active 状态的，将其移除？
    // 但如果在 setState 里做会导致死循环。
    // 另一种策略：不缓存 = 离开时销毁。
    // 我们可以在 pages 渲染时控制。
  }, []);

  const closeTab = useMemoizedFn((targetKey: string) => {
    const targetIndex = tabItems.findIndex((item) => item.key === targetKey);
    const newTabItems = tabItems.filter((item) => item.key !== targetKey);

    // 移除缓存
    setCachedPages((prev) => omit(prev, [targetKey]));
    setTabItems(newTabItems);

    // 如果关闭的是当前页，跳转到临近页
    if (targetKey === activeKey) {
      if (newTabItems.length > 0) {
        // 尝试跳到右边，没有则左边
        const nextIndex = targetIndex >= newTabItems.length ? newTabItems.length - 1 : targetIndex;
        const nextKey = newTabItems[nextIndex].key;
        navigate(nextKey);
      }
    }
  });

  const closeOtherTabs = useMemoizedFn((currentKey: string) => {
    const currentTab = tabItems.find((item) => item.key === currentKey);
    if (!currentTab) return;
    const newTabItems = [{ ...currentTab, closable: false }];
    setTabItems(newTabItems);

    const keepKeys = newTabItems.map((i) => i.key);
    setCachedPages((prev) => {
      const newCachedPages: Record<string, React.ReactNode> = {};
      keepKeys.forEach((k) => {
        if (prev[k]) newCachedPages[k] = prev[k];
      });
      return newCachedPages;
    });

    if (activeKey !== currentKey) {
      navigate(currentKey);
    }
  });

  const closeRightTabs = useMemoizedFn((currentKey: string) => {
    const currentIndex = tabItems.findIndex((i) => i.key === currentKey);
    const rightItems = tabItems.slice(currentIndex + 1);
    const rightKeys = rightItems.map((i) => i.key);

    const newTabItems = tabItems.filter((i) => !rightKeys.includes(i.key));
    setTabItems(newTabItems);

    setCachedPages((prev) => omit(prev, rightKeys));

    if (rightKeys.includes(activeKey)) {
      navigate(currentKey);
    }
  });

  const handleTabEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove' && isString(targetKey)) {
      closeTab(targetKey);
    }
  };

  const handleTabClick = (key: string) => {
    navigate(key);
  };

  const renderTabLabel = (item: TabItem) => {
    const menuItems: MenuProps['items'] = [
      {
        key: 'close',
        label: t('creek-keep-alive.index.guanBiDangQian', '关闭当前'),
        disabled: tabItems.length <= 1,
        onClick: () => closeTab(item.key),
      },
      {
        key: 'closeOthers',
        label: t('creek-keep-alive.index.guanBiQiTa', '关闭其他'),
        onClick: () => closeOtherTabs(item.key),
      },
      {
        key: 'closeRight',
        label: t('creek-keep-alive.index.guanBiYouCe', '关闭右侧'),
        onClick: () => closeRightTabs(item.key),
      },
    ];

    return (
      <Dropdown menu={{ items: menuItems }} trigger={['contextMenu']}>
        <span>{item.label}</span>
      </Dropdown>
    );
  };

  return (
    <div className="creek-keep-alive">
      <Tabs
        activeKey={activeKey}
        type="editable-card"
        hideAdd
        onChange={handleTabClick}
        onEdit={handleTabEdit}
        tabBarStyle={{ margin: 0, ...tabBarStyle }}
        items={tabItems.map((item) => ({
          ...item,
          label: renderTabLabel(item),
          children: (
            <div key={item.key} style={{ height: '100%', display: activeKey === item.key ? 'block' : 'none' }}>
              {/* 当前激活页渲染实时outlet，非激活页渲染缓存 */}
              {activeKey === item.key
                ? outlet
                : !isPathExcluded(item.key)
                  ? cachedPages[item.key]
                  : null}
            </div>
          ),
        }))}
      />
    </div>
  );
};
