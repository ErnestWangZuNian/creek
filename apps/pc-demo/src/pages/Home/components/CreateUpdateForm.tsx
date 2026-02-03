import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import React from 'react';

const CreateUpdateForm: React.FC = () => {
  return (
    <>
  
      <ProFormText
        name="name"
        label="宠物名称"
        placeholder="请输入宠物名称"
        rules={[
          {
            required: true,
            message: '请输入宠物名称！',
          },
        ]}
      />
      <ProFormSelect
        name="status"
        label="状态"
        placeholder="请选择状态"
        valueEnum={{
          available: 'Available',
          pending: 'Pending',
          sold: 'Sold',
        }}
        rules={[
          {
            required: true,
            message: '请选择状态！',
          },
        ]}
      />
    </>
  );
};

export default CreateUpdateForm;
