import { useMemoizedFn } from 'ahooks';
import { App } from 'antd';
import React, { createContext, useContext, useMemo, useState } from 'react';

import { DrawerHelper } from './DrawerHelper';
import { ModalHelper } from './ModalHelper';
import {
  AppContextType,
  DrawerConfig,
  FormDrawerConfig,
  FormModalConfig,
  ModalConfig,
  NormalDrawerConfig,
  NormalModalConfig,
} from './types';

// --- Helper Hook for State Management ---
const usePopupState = <T extends object>() => {
  const [state, setState] = useState<{ open: boolean; config: T }>({
    open: false,
    config: {} as T,
  });

  const show = useMemoizedFn((config: T) => {
    setState({ open: true, config });
  });

  const close = useMemoizedFn(() => {
    setState((prev) => ({ ...prev, open: false }));
  });

  return { ...state, show, close };
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const drawer = usePopupState<DrawerConfig>();
  const modal = usePopupState<ModalConfig>();

  const handleCloseModal = useMemoizedFn(() => {
    modal.close();
  });

  const handleCloseDrawer = useMemoizedFn(() => {
    drawer.close();
  });

  const contextValue = useMemo(
    () => ({
      openDrawer: drawer.show,
      closeDrawer: handleCloseDrawer,
      openModal: modal.show,
      closeModal: handleCloseModal,
    }),
    [drawer.show, handleCloseDrawer, modal.show, handleCloseModal],
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      <DrawerHelper open={drawer.open} config={drawer.config} onClose={handleCloseDrawer} />
      <ModalHelper open={modal.open} config={modal.config} onClose={handleCloseModal} />
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const antdApp = App.useApp();
  const appContext = useContext(AppContext);

  return useMemo(() => {
    const { openDrawer, closeDrawer, openModal, closeModal } = appContext || {};
    const warn = () => console.warn('AppProvider is missing');

    const createOpener = <T extends NormalModalConfig | NormalDrawerConfig>(
      opener: ((config: T) => void) | undefined,
      type: 'normal',
    ) => {
      return (config: T) => {
        if (opener) {
          opener({ ...config, type } as T);
        } else {
          warn();
        }
      };
    };

    const createFormOpener = <T extends FormModalConfig | FormDrawerConfig>(
      opener: ((config: T) => void) | undefined,
      type: 'form',
    ) => {
      return (config: Omit<T, 'type'>) => {
        if (opener) {
          opener({ ...config, type } as T);
        } else {
          warn();
        }
      };
    };

    return {
      ...antdApp,
      drawer: {
        open: createOpener<NormalDrawerConfig>(openDrawer, 'normal'),
        openForm: createFormOpener<FormDrawerConfig>(openDrawer, 'form'),
        close: closeDrawer || warn,
      },
      modal: {
        ...antdApp.modal,
        open: createOpener<NormalModalConfig>(openModal, 'normal'),
        openForm: createFormOpener<FormModalConfig>(openModal, 'form'),
        close: closeModal || warn,
      },
    };
  }, [antdApp, appContext]);
};

export * from './types';
