import { CaretRightOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Card, Col, message, Row, Statistic, Typography } from 'antd';
import { useRef } from 'react';
import { useNavigate } from 'umi';

import { CreekPageContainer, CreekTable, useApp } from '@creekjs/web-components';

import { addPet, deletePet, findPetsByStatus, updatePet } from '@/service/pet';
import { useT } from '@/utils/i18n';

import CreateUpdateForm from './components/CreateUpdateForm';

const PetList = () => {
  const t = useT();
  const navigate = useNavigate();

  const actionRef = useRef<ActionType>();
  const { modal } = useApp();

  const handleAdd = async (fields: API.Pet) => {
    await addPet({
      ...fields,
    });
    message.success(t('pages.Demo.index.tianJiaChengGong', '添加成功'));
    return true;
  };

  const handleUpdate = async (fields: API.Pet) => {
    await updatePet({
      ...fields,
    });
    message.success(t('pages.Demo.index.peiZhiChengGong', '配置成功'));
    return true;
  };

  const handleRemove = async (selectedRow: API.Pet) => {
    modal.confirm({
      title: t('pages.Demo.index.queRenShanChuMa？', '确认删除吗？'),
      okText: t('pages.Demo.index.queRen', '确认'),
      okType: 'danger',
      onOk: async () => {
        await deletePet({
          petId: selectedRow.id!,
        });
        message.success(t('pages.Demo.index.shanChuChengGong，JiJiangShuaXin', '删除成功，即将刷新'));
        actionRef.current?.reload();
      },
    });
  };

  const openEditModal = (record?: API.Pet) => {
    modal.openForm({
      title: record ? t('pages.Demo.index.bianJiChongWu', '编辑宠物') : t('pages.Demo.index.xinJianChongWu', '新建宠物'),
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
      title: t('pages.Demo.index.mingCheng', '名称'),
      dataIndex: 'name',
      hideInSearch: true,
      render(_, record) {
        return `${record.name}-${record.name}-${record.name}-${111}`;
      },
    },
    {
      title: t('pages.Demo.index.mingCheng1', '名称1'),
      dataIndex: 'name1',
      hideInSearch: true,
    },
    {
      title: t('pages.Demo.index.mingCheng2', '名称2'),
      dataIndex: 'name2',
      hideInSearch: true,
    },
    {
      title: t('pages.Demo.index.mingCheng3', '名称3'),
      dataIndex: 'name3',
      hideInSearch: true,
    },
    {
      title: t('pages.Demo.index.mingCheng4', '名称4'),
      dataIndex: 'name4',
      hideInSearch: true,
    },
    {
      title: t('pages.Demo.index.mingCheng5', '名称5'),
      dataIndex: 'name5',
      hideInSearch: true,
    },
    {
      title: t('pages.Demo.index.zhuangTai', '状态'),
      dataIndex: 'status',
      valueEnum: {
        available: {
          text: 'Available',
          status: 'Success',
        },
        pending: {
          text: 'Pending',
          status: 'Processing',
        },
        sold: {
          text: 'Sold',
          status: 'Error',
        },
      },
    },
    {
      title: t('pages.Demo.index.caoZuo', '操作'),
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <Typography.Link key="view" onClick={() => navigate(`/home/${record.id}?name=${record.name}&status=${record.status}`)}>
          <EyeOutlined /> {t('pages.Demo.index.chaKan', '查看')}
        </Typography.Link>,
        <Typography.Link key="config" onClick={() => openEditModal(record)}>
          {t('pages.Demo.index.bianJi', '编辑')}
        </Typography.Link>,
        <Typography.Link
          key="delete"
          onClick={() => {
            handleRemove(record);
          }}
        >
          {t('pages.Demo.index.shanChu', '删除')}
        </Typography.Link>,
      ],
    },
  ];
  return (
    <CreekPageContainer>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title={t('pages.Demo.index.zongShu', '总数')} value={128} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title={t('pages.Demo.index.keYong', '可用')} value={86} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title={t('pages.Demo.index.daiChuLi', '待处理')} value={28} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title={t('pages.Demo.index.yiShouChu', '已售出')} value={14} />
          </Card>
        </Col>
      </Row>
      <CreekTable
        actionRef={actionRef}
        showIndex={false}
        pagination={{
          defaultPageSize:10,
          pageSize:10,
        }}
        rowKey={(row) => `${row.id}-${row.status}-${row.name}`}
        // expandable={{
        //   expandIcon: ({ expanded, onExpand, record }) => (
        //     <CaretRightOutlined
        //       onClick={(e) => onExpand(record, e)}
        //       style={{
        //         transition: 'transform 0.2s',
        //         transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        //         color: '#8c8c8c',
        //         fontSize: 14,
        //       }}
        //     />
        //   ),
        // }}
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" icon={<DownloadOutlined />} key="primary" onClick={() => openEditModal()}>
            {t('pages.Demo.index.xinJian', '新建')}
          </Button>,
        ]}
        request={async (params) => {
          // 如果用户没有选择状态，则默认查询所有状态
          const status = params.status ? [params.status] : ['available', 'pending', 'sold'];
          const statusParam = (status as string[]).join(',');
          const res = await findPetsByStatus({
            status: statusParam as any,
            ...params,
          });
          // 给前几条数据注入 children，测试展开效果
          const list = (res as any)?.data ?? res ?? [];
          const allData = (Array.isArray(list) ? list : []).map((item: any, index: number) => {
            if (index === 0) {
              return {
                ...item,
                children: Array.from({ length: 5 }).map((_, ci) => ({
                  ...item,
                  id: `${item.id}-child-${ci}`,
                  name: `子记录 ${item.name}-${ci + 1}`,
                  name1: `子记录名称1-${ci + 1}`,
                })),
              };
            }
            if (index === 1) {
              return {
                ...item,
                children: Array.from({ length: 8 }).map((_, ci) => ({
                  ...item,
                  id: `${item.id}-child-${ci}`,
                  name: `子记录 ${item.name}-${ci + 1}`,
                  name2: `子记录名称2-${ci + 1}`,
                })),
              };
            }
            if (index === 2) {
              return {
                ...item,
                children: Array.from({ length: 12 }).map((_, ci) => ({
                  ...item,
                  id: `${item.id}-child-${ci}`,
                  name: `子记录 ${item.name}-${ci + 1}`,
                })),
              };
            }
            return item;
          });
          // ProTable 的 request 是服务端分页模式，需要自己根据 current/pageSize 切片数据
          const { current = 1, pageSize = 20 } = params;
          const start = (current - 1) * pageSize;
          const data = allData.slice(start, start + pageSize);
          return { data, total: allData.length, success: true };
        }}
        columns={columns}
      />
    </CreekPageContainer>
  );
};
export default PetList;
