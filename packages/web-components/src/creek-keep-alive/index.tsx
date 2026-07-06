import { useMemoizedFn } from 'ahooks';
import { Dropdown, MenuProps, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import { isRegExp, isString } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { matchPath, matchRoutes, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useT } from '@creekjs/i18n/react';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    .ant-tabs-nav {
      margin: 0;
      padding: 0;
      background: ${token.colorBgLayout};
      border-bottom: 1px solid ${token.colorBorderSecondary};
      min-height: auto;
      &::before {
        display: none;
      }
    }

    .ant-tabs-nav-list {
      .ant-tabs-tab {
        margin: 2px 1px;
        padding: 2px 10px;
        background: transparent;
        border: none;
        border-radius: ${token.borderRadiusSM}px;
        transition: all 0.2s;
        font-size: 12px;
        line-height: 20px;

        .ant-tabs-tab-remove {
          margin-left: 4px;
          margin-right: -4px;
          font-size: 9px;
          color: ${token.colorTextQuaternary};
          transition: color 0.2s;
          &:hover {
            color: ${token.colorTextSecondary};
          }
        }

        &:hover {
          background: ${token.colorFillQuaternary};
          .ant-tabs-tab-remove {
            color: ${token.colorTextTertiary};
          }
        }
      }

      .ant-tabs-tab-active {
        background: ${token.colorBgContainer};
        box-shadow: none;
        .ant-tabs-tab-btn {
          color: ${token.colorPrimary};
          font-weight: 600;
        }
        &:hover {
          background: ${token.colorBgContainer};
        }
      }
    }
  `,
  tabLabel: css`
    display: inline-flex;
    align-items: center;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
}));

export interface CreekKeepAliveProps {
  /**
   * 不需要缓存的路径
   */
  exclude?: (string | RegExp)[];
  /**
   * 不创建新Tab的路由模式（匹配时复用最近的父级Tab，内容在隐藏Tab中渲染）
   */
  silentRoutes?: string[];
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
  /**
   * redirect 路由路径映射，key 为 redirect 路径，value 为目标路径，用于过滤和跳转
   */
  redirectPaths?: Record<string, string>;
}

interface TabItem {
  key: string;
  label: React.ReactNode;
  closable?: boolean;
}

export const CreekKeepAlive: React.FC<CreekKeepAliveProps> = (props) => {
  const { exclude = [], silentRoutes = [], getTabTitle, tabBarStyle, maxTabCount = 20, routes = [], redirectPaths = {} } = props;

  const t = useT();
  const { styles } = useStyles();
  const location = useLocation();
  const navigate = useNavigate();

  const [tabItems, setTabItems] = useState<TabItem[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');

  // 缓存每个路径对应的 React element，保证同一页面始终复用同一个 element 引用
  // 这样 React reconciler 不会卸载/重新挂载组件，从而实现 keep-alive
  // 使用 state 以便缓存变化时触发重新渲染
  const [cachedElements, setCachedElements] = useState<Record<string, React.ReactNode>>({});
  // 使用 ref 追踪 cachedElements，避免 useEffect 依赖 cachedElements 导致循环触发
  const cachedElementsRef = useRef(cachedElements);
  cachedElementsRef.current = cachedElements;

  // 根据路由配置，解析指定路径对应的叶子路由 element
  const resolveElement = (path: string): React.ReactNode | null => {
    if (!routes?.length) return null;
    const matches = matchRoutes(routes, path);
    if (!matches?.length) return null;
    // 取最后一个有 element 的 match
    for (let i = matches.length - 1; i >= 0; i--) {
      const el = matches[i].route.element;
      if (el != null) return el;
    }
    return null;
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

    // redirect 路由不创建 tab，直接 navigate 到目标路径
    if (currentPath in redirectPaths) {
      navigate(redirectPaths[currentPath], { replace: true });
      return;
    }

    // 不需要缓存的路径，不创建 tab
    if (isPathExcluded(currentPath)) return;

    // 静默路由：不创建可见 tab，复用最近的父级 tab 高亮
    const matchedSilentPattern = silentRoutes.find((pattern) => matchPath(pattern, currentPath));
    if (matchedSilentPattern) {
      // 找到最近的已存在父级 tab（路径是当前路径的前缀）
      const parentTab = tabItems
        .filter((item) => currentPath !== item.key && !silentRoutes.some((p) => matchPath(p, item.key)) && currentPath.startsWith(item.key))
        .sort((a, b) => b.key.length - a.key.length)[0];

      const parentKey = parentTab?.key || '/';

      // 替换同模式的旧幽灵 tab（如从 /home/123 导航到 /home/456）
      const oldGhost = tabItems.find((i) => i.key !== currentPath && silentRoutes.some((p) => matchPath(p, i.key)) && matchPath(matchedSilentPattern, i.key));
      if (oldGhost) {
        setTabItems((prev) => prev.filter((i) => i.key !== oldGhost.key));
        setCachedElements((prev) => {
          const next = { ...prev };
          delete next[oldGhost.key];
          return next;
        });
      }

      // 缓存静默路由的 element（幽灵 tab 需要）
      const element = resolveElement(currentPath) ?? <Outlet />;
      if (!cachedElementsRef.current[currentPath]) {
        setCachedElements((prev) => ({ ...prev, [currentPath]: element }));
      }

      // 确保父级 tab 存在
      if (!parentTab && !tabItems.find((i) => i.key === parentKey)) {
        const title = getTabTitle?.(parentKey) || parentKey;
        setTabItems((prev) => {
          if (prev.find((i) => i.key === parentKey)) return prev;
          return [...prev, { key: parentKey, label: title, closable: prev.length > 0 }];
        });
      }

      // 添加幽灵 tab（tab 按钮通过 CSS 隐藏，但内容会渲染）
      setTabItems((prev) => {
        if (prev.find((i) => i.key === currentPath)) return prev;
        const title = getTabTitle?.(currentPath) || currentPath;
        return [...prev, { key: currentPath, label: title, closable: false }];
      });

      setActiveKey(currentPath);
      return;
    }

    // 如果路由配置中没有对应的 element，使用 Outlet 作为 fallback
    const element = resolveElement(currentPath) ?? <Outlet />;

    // 缓存当前路径的 element（仅首次缓存，后续复用同一个 element 引用）
    // 使用 ref 读取最新值，避免将 cachedElements 加入依赖数组导致循环触发
    if (!cachedElementsRef.current[currentPath]) {
      setCachedElements((prev) => ({ ...prev, [currentPath]: element }));
    }

    setActiveKey(currentPath);

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
  }, [location.pathname]);

  const closeTab = useMemoizedFn((targetKey: string) => {
    const visibleItems = tabItems.filter((i) => !silentRoutes.some((p) => matchPath(p, i.key)));
    const targetIndex = visibleItems.findIndex((item) => item.key === targetKey);
    const newTabItems = tabItems.filter((item) => item.key !== targetKey);

    // 同时移除关联的静默路由缓存
    setCachedElements((prev) => {
      const next = { ...prev };
      delete next[targetKey];
      Object.keys(next).forEach((key) => {
        if (key.startsWith(targetKey + '/') && !newTabItems.find((i) => i.key === key)) {
          delete next[key];
        }
      });
      return next;
    });
    setTabItems(newTabItems);

    // 如果关闭的是当前页，跳转到临近的可见 tab
    if (targetKey === activeKey) {
      const remainingVisible = newTabItems.filter((i) => !silentRoutes.some((p) => matchPath(p, i.key)));
      if (remainingVisible.length > 0) {
        const nextIndex = targetIndex >= remainingVisible.length ? remainingVisible.length - 1 : targetIndex;
        const nextKey = remainingVisible[nextIndex].key;
        navigate(nextKey);
      }
    }
  });

  const closeOtherTabs = useMemoizedFn((currentKey: string) => {
    const currentTab = tabItems.find((item) => item.key === currentKey);
    if (!currentTab) return;
    const newTabItems = [{ ...currentTab, closable: false }];
    const keepKeys = new Set(newTabItems.map((i) => i.key));
    setTabItems(newTabItems);

    // 仅保留当前 tab 的缓存（包括其关联的静默路由缓存）
    setCachedElements((prev) => {
      const next: Record<string, React.ReactNode> = {};
      Object.entries(prev).forEach(([key, value]) => {
        if (keepKeys.has(key) || (Array.from(keepKeys).some((k) => key.startsWith(k + '/')))) {
          next[key] = value;
        }
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

    // 移除右侧 tab 的缓存（包括关联的静默路由缓存）
    const keepKeys = new Set(newTabItems.map((i) => i.key));
    setCachedElements((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (!keepKeys.has(key) && !Array.from(keepKeys).some((k) => key.startsWith(k + '/'))) {
          delete next[key];
        }
      });
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

  const visibleTabs = tabItems.filter((item) =>
    !silentRoutes.some((pattern) => matchPath(pattern, item.key)),
  );

  const renderTabLabel = (item: TabItem) => {
    const menuItems: MenuProps['items'] = [
      {
        key: 'close',
        label: t('creek-keep-alive.index.guanBiDangQian', '关闭当前'),
        disabled: visibleTabs.length <= 1,
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
        <span className={styles.tabLabel}>{item.label}</span>
      </Dropdown>
    );
  };

  // 当前是否在静默路由上（用于高亮父级 tab）
  const isOnSilentRoute = silentRoutes.some((pattern) => matchPath(pattern, activeKey));
  const visualActiveKey = isOnSilentRoute
    ? visibleTabs.find((tab) => activeKey.startsWith(tab.key))?.key || activeKey
    : activeKey;

  return (
    <div className={`creek-keep-alive ${styles.container}`}>
      <Tabs
        activeKey={visualActiveKey}
        type="editable-card"
        hideAdd
        onChange={handleTabClick}
        onEdit={handleTabEdit}
        tabBarStyle={tabBarStyle}
        items={visibleTabs.map((item) => ({
          ...item,
          label: renderTabLabel(item),
          children: (
            <div key={item.key} style={{ height: '100%', display: visualActiveKey === item.key && !isOnSilentRoute ? 'block' : 'none' }}>
              {cachedElements[item.key] ?? null}
            </div>
          ),
        }))}
      />
      {isOnSilentRoute && (
        <div style={{ height: '100%' }}>
          {cachedElements[activeKey] ?? null}
        </div>
      )}
    </div>
  );
};
