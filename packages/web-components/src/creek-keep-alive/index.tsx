import { useMemoizedFn } from 'ahooks';
import { Dropdown, MenuProps, Tabs } from 'antd';
import { omit } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';

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
   * 默认首页路径
   */
  homePath?: string;
  /**
   * Tabs的样式
   */
  tabBarStyle?: React.CSSProperties;
}

interface TabItem {
  key: string;
  label: React.ReactNode;
  closable?: boolean;
}

export const CreekKeepAlive: React.FC<CreekKeepAliveProps> = (props) => {
  const { exclude = [], getTabTitle, homePath = '/', tabBarStyle } = props;
  
  const element = useOutlet();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [items, setItems] = useState<TabItem[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');
  const [pages, setPages] = useState<Record<string, React.ReactNode>>({});

  // 判断是否不需要缓存
  const isExclude = (path: string) => {
    return exclude.some(item => {
      if (typeof item === 'string') {
        return item === path;
      }
      return item.test(path);
    });
  };

  // 初始化或路由变化时更新
  useEffect(() => {
    const path = location.pathname;
    setActiveKey(path);

    // 更新页面内容缓存
    setPages(prev => {
        if (prev[path]) {
            return prev;
        }
        return {
            ...prev,
            [path]: element
        };
    });

    // 更新 Tab 列表
    setItems(prev => {
      if (prev.find(i => i.key === path)) {
        return prev;
      }
      const title = getTabTitle?.(path) || path;
      return [...prev, { key: path, label: title, closable: path !== homePath }];
    });

  }, [location.pathname, element, getTabTitle, homePath]);

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

  const removeTab = useMemoizedFn((targetKey: string) => {
    const targetIndex = items.findIndex((item) => item.key === targetKey);
    const newItems = items.filter((item) => item.key !== targetKey);
    
    // 移除缓存
    setPages(prev => omit(prev, [targetKey]));
    setItems(newItems);

    // 如果关闭的是当前页，跳转到临近页
    if (targetKey === activeKey) {
      if (newItems.length > 0) {
        // 尝试跳到右边，没有则左边
        const nextIndex = targetIndex >= newItems.length ? newItems.length - 1 : targetIndex;
        const nextKey = newItems[nextIndex].key;
        navigate(nextKey);
      } else {
        navigate(homePath);
      }
    }
  });

  const closeOthers = useMemoizedFn((currentKey: string) => {
    const newItems = items.filter(item => item.key === currentKey || item.key === homePath);
    setItems(newItems);
    
    const keepKeys = newItems.map(i => i.key);
    setPages(prev => {
        const newPages: Record<string, React.ReactNode> = {};
        keepKeys.forEach(k => {
            if (prev[k]) newPages[k] = prev[k];
        });
        return newPages;
    });
    
    if (activeKey !== currentKey) {
        navigate(currentKey);
    }
  });
  
  const closeRight = useMemoizedFn((currentKey: string) => {
      const currentIndex = items.findIndex(i => i.key === currentKey);
      const rightItems = items.slice(currentIndex + 1);
      const rightKeys = rightItems.map(i => i.key);
      
      const newItems = items.filter(i => !rightKeys.includes(i.key));
      setItems(newItems);
      
      setPages(prev => omit(prev, rightKeys));
      
      if (rightKeys.includes(activeKey)) {
          navigate(currentKey);
      }
  });

  const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove' && typeof targetKey === 'string') {
      removeTab(targetKey);
    }
  };

  const onTabClick = (key: string) => {
    navigate(key);
  };

  const renderTabBar = (props: any, DefaultTabBar: any) => (
    <DefaultTabBar {...props} />
  );

  const renderTab = (item: TabItem) => {
     const menuItems: MenuProps['items'] = [
        {
            key: 'close',
            label: '关闭当前',
            disabled: item.key === homePath,
            onClick: () => removeTab(item.key)
        },
        {
            key: 'closeOthers',
            label: '关闭其他',
            onClick: () => closeOthers(item.key)
        },
        {
            key: 'closeRight',
            label: '关闭右侧',
            onClick: () => closeRight(item.key)
        }
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
        onChange={onTabClick}
        onEdit={onEdit}
        tabBarStyle={{ margin: 0, ...tabBarStyle }}
        items={items.map(item => ({
            ...item,
            label: renderTab(item),
            children: (
                <div key={item.key} style={{ height: '100%', display: activeKey === item.key ? 'block' : 'none' }}>
                   {/* 如果是不缓存的页面，且不是当前页，则不渲染(销毁) */}
                   {/* 如果是缓存页面，或者是当前页，则渲染 */}
                   {(!isExclude(item.key) || activeKey === item.key) ? pages[item.key] : null}
                </div>
            )
        }))}
      />
    </div>
  );
};
