import { PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space } from 'antd';
import React, { useRef } from 'react';

import { CreekTable, useApp } from '@creekjs/web-components';

import { addPet, deletePet, findPetsByStatus, updatePet } from '@/service/pet';
import CreateUpdateForm from './components/CreateUpdateForm';

const PetList: React.FC = () => {
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
    if (!selectedRow) return true;
    await deletePet({ petId: selectedRow.id! });
    message.success('删除成功，即将刷新');
    actionRef.current?.reload();
    return true;
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
        <Popconfirm key="delete" title="确定删除吗?" onConfirm={() => handleRemove(record)}>
          <a>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <div>
      <CreekTable<API.Pet, any>
        headerTitle="宠物列表"
        actionRef={actionRef}
        rowKey="id"
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
          // Swagger 文档提示: Multiple status values can be provided with comma separated strings
          // 尝试将数组转换为逗号分隔的字符串，或者保持数组（取决于 request 库如何处理 paramsSerializer）
          // 这里如果是 GET 请求，且后端期望逗号分隔，通常应该传字符串，或者 request 库配置了 indices: false
          // 让我们先尝试直接传数组，如果不行再 join
          // 实际上 Swagger Petstore 的实现对于 GET /pet/findByStatus?status=available&status=pending 是支持的
          // 但如果是 comma separated，应该是 ?status=available,pending
          
          // 尝试方案 1: 如果后端支持重复 key (status=a&status=b)，直接传数组通常没问题 (取决于 qs 配置)
          // 尝试方案 2: 逗号分隔
          
          // 让我们先试着用 join(',') 强制转换一下，以符合 "comma separated strings" 的描述
          const statusParam = (status as string[]).join(',');
          
          // 注意：这里需要强制类型转换，因为 findPetsByStatus 可能定义 status 为 string[]
          // 但实际发送请求时，query param 可以是 string
          const msg = await findPetsByStatus({ status: statusParam as any });
          return {
            data: msg,
            success: true,
          };
        }}
        columns={columns}
      />
    </div>
  );
};

export default PetList;
