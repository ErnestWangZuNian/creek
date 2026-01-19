import { ProFormText } from '@ant-design/pro-components';
import { CreekTable, useApp } from '@creekjs/web-components';
import { Button, Form, Typography } from 'antd';

import service from '@/service';
import { useMemoizedFn } from 'ahooks';

const HomePage = () => {
  const [form] = Form.useForm();

  const { modal } = useApp();

  const openModal = useMemoizedFn(() => {
    modal.openForm({
      form,
      modalProps: {
        width: 400,
        title: '新增店铺',
      },
      onFinish: async (values) => {
        console.log('提交的值:', values);
        await service.dianpuguanli.createStore(values);
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
  });

  const deleteStore = useMemoizedFn(async (storeName?: string) => {
    modal.confirm({
      title: '确认删除店铺吗？',
      okText: '确认',
      okType: 'danger',
      onOk: async () => {
        console.log(storeName);
      },
    });
  });

  return (
    <>
      <CreekTable<API.Store, API.getStoresPageParams>
        rowKey="storeName"
        request={(params) => {
          return service.dianpuguanli.getStoresPage(params);
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
          {
            dataIndex: 'operation',
            title: '操作',
            valueType: 'option',
            render: (_, record) => {
              return (
                <>
                  <Typography.Link onClick={() => deleteStore(record.storeName)}>删除</Typography.Link>
                </>
              );
            },
            search: false,
          },
        ]}
      />
    </>
  );
};

export default HomePage;
