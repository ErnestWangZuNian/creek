import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space } from 'antd';
import { useRef } from 'react';

import { CreekTable, useApp } from '@creekjs/web-components';

import { addPet, deletePet, findPetsByStatus, updatePet } from '@/service/pet';
import CreateUpdateForm from './components/CreateUpdateForm';

const PetList = () => {
  const actionRef = useRef<ActionType>();
  const { modal } = useApp();

  const handleAdd = async (fields: API.Pet) => {
    await addPet({ ...fields });
    message.success('添加成功');
    return true;
  };

  const handleUpdate = async (fields: API.Pet) => {
    await updatePet({ ...fields });
    message.success('配置成功');
    return true;
  };

  const handleRemove = async (selectedRow: API.Pet) => {
    modal.confirm({
      title: '确认删除吗？',
      okText: '确认',
      okType: 'danger',
      onOk: async () => {
        await deletePet({ petId: selectedRow.id! });
        message.success('删除成功，即将刷新');
        actionRef.current?.reload();
      },
    });
  };

  const openEditModal = (record?: API.Pet) => {
    modal.openForm({
      title: record ? '编辑宠物' : '新建宠物',
      content: <CreateUpdateForm />,
      initialValues: record,
      onFinish: async (values) => {
        const success = record ? await handleUpdate(values) : await handleAdd(values);
        if (success) {
          actionRef.current?.reload();
          return true;
        }
        return false;
      },
    });
  };

  const columns: ProColumns<API.Pet>[] = [
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        available: { text: 'Available', status: 'Success' },
        pending: { text: 'Pending', status: 'Processing' },
        sold: { text: 'Sold', status: 'Error' },
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a key="config" onClick={() => openEditModal(record)}>
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            handleRemove(record);
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <div>
      <CreekTable
        headerTitle="宠物列表"
        actionRef={actionRef}
        rowKey={(row) => `${row.id}-${row.status}-${row.name}`}
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => openEditModal()}>
            <Space>
              <PlusOutlined />
              <span>新建</span>
            </Space>
          </Button>,
        ]}
        request={async (params) => {
          // 如果用户没有选择状态，则默认查询所有状态
          const status = params.status ? [params.status] : ['available', 'pending', 'sold'];
          const statusParam = (status as string[]).join(',');
          return findPetsByStatus({ status: statusParam as any, ...params });
        }}
        columns={columns}
      />
    </div>
  );
};

export default PetList;
