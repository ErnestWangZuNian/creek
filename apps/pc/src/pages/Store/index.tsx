import { ProFormText } from '@ant-design/pro-components';
import { CreekIcon, CreekTable, useApp } from '@creekjs/web-components';
import { Button, Form } from 'antd';
import { useCallback } from 'react';

import service from '@/service';

const HomePage = () => {
  const [form] = Form.useForm();

  const { modal } = useApp();

  const openModal = useCallback(() => {
    modal.openForm({
      form,
      modalProps: {
        width: 400,
        title: '新增店铺',
      },
      onFinish: async (values) => {
        console.log('提交的值:', values);
        await service.storeController.createStore(values);
        return true;
      },
      content: (
        <>
          <ProFormText
            rules={[
              {
                required: true,
              },
            ]}
            required
            width="md"
            name="storeName"
            label="店铺名称"
            tooltip="最长为 24 位"
            placeholder="请输入店铺名称"
          />
        </>
      ),
    });
  }, [form, modal]);

  return (
    <>
      <CreekIcon />
      <CreekTable
        rowKey="name"
        request={() => {
          return service.storeController.getAllStores();
        }}
        toolBarRender={() => {
          return [
            <Button type="primary" key="new" onClick={() => openModal()}>
              新增店铺
            </Button>,
          ];
        }}
        columns={[
          {
            dataIndex: 'storeName',
            title: '店铺名称',
          },
          {
            dataIndex: 'createTime',
            title: '创建时间',  
            search: false,
          },
          {
            dataIndex: 'createTime',
            title: '更新时间',
            search: false,
          },
        ]}
      />
    </>
  );
};

export default HomePage;
