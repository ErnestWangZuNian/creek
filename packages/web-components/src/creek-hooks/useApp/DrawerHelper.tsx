import { DrawerForm } from '@ant-design/pro-components';
import { Drawer } from 'antd';
import { omit } from 'lodash';
import React from 'react';
import { DrawerConfig, FormDrawerConfig, NormalDrawerConfig } from './types';

interface DrawerHelperProps {
  open: boolean;
  config: DrawerConfig;
  onClose: () => void;
}

export const DrawerHelper: React.FC<DrawerHelperProps> = ({ open, config, onClose }) => {
  const { content, type, ...restConfig } = config;

  if (type === 'form') {
    return (
      <DrawerForm
        open={open}
        onOpenChange={(visible) => !visible && onClose()}
        drawerProps={{
          destroyOnHidden: true,
          onClose,
          ...((config as FormDrawerConfig).drawerProps || {}),
        }}
        {...(omit(restConfig, 'drawerProps') as any)}
      >
        {content}
      </DrawerForm>
    );
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      destroyOnHidden
      {...(restConfig as NormalDrawerConfig)}
    >
      {content}
    </Drawer>
  );
};
