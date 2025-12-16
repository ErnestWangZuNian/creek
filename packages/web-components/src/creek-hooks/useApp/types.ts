import { DrawerFormProps, ModalFormProps } from '@ant-design/pro-components';
import { DrawerProps, ModalProps } from 'antd';
import React from 'react';

// --- Common ---
export type BaseConfig = {
  content?: React.ReactNode;
};

// --- Modal Types ---
export type NormalModalConfig = BaseConfig & ModalProps & { type?: 'normal' };
export type FormModalConfig<T = any> = BaseConfig & Omit<ModalFormProps<T>, 'content'> & { type: 'form' };
export type ModalConfig = NormalModalConfig | FormModalConfig;

// --- Drawer Types ---
export type NormalDrawerConfig = BaseConfig & DrawerProps & { type?: 'normal' };
export type FormDrawerConfig<T = any> = BaseConfig & Omit<DrawerFormProps<T>, 'content'> & { type: 'form' };
export type DrawerConfig = NormalDrawerConfig | FormDrawerConfig;

export interface AppContextType {
  openDrawer: (config: DrawerConfig) => void;
  closeDrawer: () => void;
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}
