import { ProFormText } from '@ant-design/pro-components';
import { CreekIcon, CreekTable, useApp } from '@creekjs/web-components';
import { Button, Form } from 'antd';
import { useCallback } from 'react';

import service from '@/service';


const HomePage = () => {
  const [form] = Form.useForm();

  const { drawer } = useApp();

  const openModal = useCallback(() => {
    drawer.openForm({
      form,
      drawerProps: {
        title: '新建用户',
      },
      onFinish: async (values) => {
        console.log('提交的值:', values);
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
            name="name"
            label="签约客户名称"
            tooltip="最长为 24 位"
            placeholder="请输入名称"
          />
        </>
      ),
    });
  }, [form, drawer]);

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
              新建
            </Button>,
            <Button key="drawer">打开抽屉</Button>,
            <Button type="primary" key="test">
              测试
            </Button>,
          ];
        }}
        onSubmit={(values) => {
          console.log('提交的值:', values);
        }}
        options={{
          importConfig: {
            onClick: () => {
              console.log('点击了导入');
            },
          },
          exportConfig: {
            onClick: () => {
              console.log('点击了导出');
            },
          },
        }}
        columns={[
          {
            dataIndex: 'name',
            title: '姓名',
          },
        ]}
      />
    </>
  );
};

export default HomePage;
