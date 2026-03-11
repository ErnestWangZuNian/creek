import { t } from '@/utils/i18n'
import { DownloadOutlined } from '@ant-design/icons'
import { ActionType, ProColumns } from '@ant-design/pro-components'
import { useIntl } from '@umijs/max'
import { Button, message } from 'antd'
import { useRef } from 'react'

import { CreekTable, useApp } from '@creekjs/web-components'

import { addPet, deletePet, findPetsByStatus, updatePet } from '@/service/pet'
import CreateUpdateForm from './components/CreateUpdateForm'

const PetList = () => {
  const actionRef = useRef<ActionType>()
  const { modal } = useApp()
  useIntl()

  const handleAdd = async (fields: API.Pet) => {
    await addPet({ ...fields })
    message.success(t('添加成功'))
    return true
  }

  const handleUpdate = async (fields: API.Pet) => {
    await updatePet({ ...fields })
    message.success(t('配置成功'))
    return true
  }

  const handleRemove = async (selectedRow: API.Pet) => {
    modal.confirm({
      title: t('确认删除吗？'),
      okText: t('确认'),
      okType: 'danger',
      onOk: async () => {
        await deletePet({ petId: selectedRow.id! })
        message.success(t('删除成功，即将刷新'))
        actionRef.current?.reload()
      },
    })
  }

  const openEditModal = (record?: API.Pet) => {
    modal.openForm({
      title: record ? t('编辑宠物') : t('新建宠物'),
      content: <CreateUpdateForm />,
      initialValues: record,
      onFinish: async (values) => {
        const success = record
          ? await handleUpdate(values)
          : await handleAdd(values)
        if (success) {
          actionRef.current?.reload()
          return true
        }
        return false
      },
    })
  }

  const columns: ProColumns<API.Pet>[] = [
    {
      title: t('名称'),
      dataIndex: 'name',
      hideInSearch: true,
      render(_, record) {
        return `${record.name}-${record.name}-${record.name}-${111}`
      },
    },
    {
      title: t('名称1'),
      dataIndex: 'name1',
      hideInSearch: true,
    },
    {
      title: t('名称2'),
      dataIndex: 'name2',
      hideInSearch: true,
    },
    {
      title: t('名称3'),
      dataIndex: 'name3',
      hideInSearch: true,
    },
    {
      title: t('名称4'),
      dataIndex: 'name4',
      hideInSearch: true,
    },
    {
      title: t('名称5'),
      dataIndex: 'name5',
      hideInSearch: true,
    },
    {
      title: t('状态'),
      dataIndex: 'status',
      valueEnum: {
        available: { text: 'Available', status: 'Success' },
        pending: { text: 'Pending', status: 'Processing' },
        sold: { text: 'Sold', status: 'Error' },
      },
    },
    {
      title: t('操作'),
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a key="config" onClick={() => openEditModal(record)}>
          {t('编辑')}
        </a>,
        <a
          key="delete"
          onClick={() => {
            handleRemove(record)
          }}
        >
          {t('删除')}
        </a>,
      ],
    },
  ]

  return (
    <div>
      <CreekTable
        actionRef={actionRef}
        rowKey={(row) => `${row.id}-${row.status}-${row.name}`}
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            key="primary"
            onClick={() => openEditModal()}
          >
            {t('新建')}
          </Button>,
        ]}
        request={async (params) => {
          // 如果用户没有选择状态，则默认查询所有状态
          const status = params.status
            ? [params.status]
            : ['available', 'pending', 'sold']
          const statusParam = (status as string[]).join(',')
          return findPetsByStatus({ status: statusParam as any, ...params })
        }}
        columns={columns}
      />
    </div>
  )
}

export default PetList
