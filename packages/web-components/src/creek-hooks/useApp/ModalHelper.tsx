import { ModalForm } from '@ant-design/pro-components';
import { Modal } from 'antd';
import { omit } from 'lodash';
import React from 'react';
import { FormModalConfig, ModalConfig, NormalModalConfig } from './types';

interface ModalHelperProps {
  open: boolean;
  config: ModalConfig;
  onClose: () => void;
}

export const ModalHelper: React.FC<ModalHelperProps> = ({ open, config, onClose }) => {
  const { content, type, ...restConfig } = config;

  if (type === 'form') {
    return (
      <ModalForm
        open={open}
        onOpenChange={(visible) => !visible && onClose()}
        modalProps={{
          destroyOnHidden: true,
          onCancel: onClose,
          ...((config as FormModalConfig).modalProps || {}),
        }}
        {...(omit(restConfig, 'modalProps') as any)}
      >
        {content}
      </ModalForm>
    );
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      destroyOnHidden
      {...(restConfig as NormalModalConfig)}
    >
      {content}
    </Modal>
  );
};
