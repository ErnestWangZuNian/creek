import { useMemoizedFn } from 'ahooks';
import { Dropdown, MenuProps, Tabs } from 'antd';
import { isRegExp, isString } from 'lodash';
import React, { useEffect, useState } from 'react';
import { matchRoutes, useLocation, useNavigate } from 'react-router-dom';

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
  /**
   * 路由配置（含 element），用于解析每个路径对应的页面组件
   */
  routes?: any[];
}

interface TabItem {
  key: string;
  label: React.ReactNode;
  closable?: boolean;
}

export const CreekKeepAlive: React.FC<CreekKeepAliveProps> = (props) => {
  const { exclude = [], getTabTitle, tabBarStyle, maxTabCount = 20, routes = [] } = props;

  const t = useT();
  const location = useLocation();
  const navigate = useNavigate();

  const [tabItems, setTabItems] = useState<TabItem[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');

  // 缓存每个路径对应的 React element，保证同一页面始终复用同一个 element 引用
  // 这样 React reconciler 不会卸载/重新挂载组件，从而实现 keep-alive
  // 使用 state 以便缓存变化时触发重新渲染
  const [cachedElements, setCachedElements] = useState<Record<string, React.ReactNode>>({});

  // 根据路由配置，解析指定路径对应的叶子路由 element
  const resolveElement = (path: string): React.ReactNode | null => {
    if (!routes?.length) return null;
    const matches = matchRoutes(routes, path);
    if (!matches?.length) return null;
    // 取最后一个 match（叶子路由），即实际页面组件
    return matches[matches.length - 1].route.element ?? null;
  };

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

    // 缓存当前路径的 element（仅首次缓存，后续复用同一个 element 引用）
    if (!cachedElements[currentPath] && !isPathExcluded(currentPath)) {
      const element = resolveElement(currentPath);
      if (element) {
        setCachedElements((prev) => ({ ...prev, [currentPath]: element }));
      }
    }

    // 更新 Tab 列表
    setTabItems((prev) => {
      if (prev.find((i) => i.key === currentPath)) {
        // 更新现有 tab 的 closable 状态（只有最后一个 tab 时不可关闭）
        return prev.map((i) => ({ ...i, closable: prev.length > 1 }));
      }
      const title = getTabTitle?.(currentPath) || currentPath;
      const newItems = [...prev, { key: currentPath, label: title, closable: prev.length > 0 }];

      // 只有1个 tab 时不可关闭
      if (newItems.length === 1) {
        newItems[0].closable = false;
      }

      // 超过最大数量限制，移除最早的可关闭 tab
      if (newItems.length > maxTabCount) {
        const indexToRemove = newItems.findIndex((item) => item.closable && item.key !== currentPath);
        if (indexToRemove !== -1) {
          const itemToRemove = newItems[indexToRemove];
          setCachedElements((prev) => {
            const next = { ...prev };
            delete next[itemToRemove.key];
            return next;
          });
          newItems.splice(indexToRemove, 1);
        }
      }
      return newItems;
    });
  }, [location.pathname, getTabTitle, maxTabCount, cachedElements]);

  const closeTab = useMemoizedFn((targetKey: string) => {
    const targetIndex = tabItems.findIndex((item) => item.key === targetKey);
    const newTabItems = tabItems.filter((item) => item.key !== targetKey);

    // 移除缓存，组件将卸载
    setCachedElements((prev) => {
      const next = { ...prev };
      delete next[targetKey];
      return next;
    });
    setTabItems(newTabItems);

    // 如果关闭的是当前页，跳转到临近页
    if (targetKey === activeKey) {
      if (newTabItems.length > 0) {
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

    // 仅保留当前 tab 的缓存
    const keepKeys = new Set(newTabItems.map((i) => i.key));
    setCachedElements((prev) => {
      const next: Record<string, React.ReactNode> = {};
      keepKeys.forEach((k) => {
        if (prev[k]) next[k] = prev[k];
      });
      return next;
    });

    if (activeKey !== currentKey) {
      navigate(currentKey);
    }
  });

  const closeRightTabs = useMemoizedFn((currentKey: string) => {
    const currentIndex = tabItems.findIndex((i) => i.key === currentKey);
    const rightItems = tabItems.slice(currentIndex + 1);
    const rightKeys = new Set(rightItems.map((i) => i.key));

    const newTabItems = tabItems.filter((i) => !rightKeys.has(i.key));
    setTabItems(newTabItems);

    // 移除右侧 tab 的缓存
    setCachedElements((prev) => {
      const next = { ...prev };
      rightKeys.forEach((key) => { delete next[key]; });
      return next;
    });

    if (rightKeys.has(activeKey)) {
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
              {cachedElements[item.key] ?? null}
            </div>
          ),
        }))}
      />
    </div>
  );
};
