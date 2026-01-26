
import { ActionType, ProCard, ProFormDigit, ProFormText, ProFormTreeSelect, ProList } from '@ant-design/pro-components';
import { CreekTable, useApp } from '@creekjs/web-components';
import { useMemoizedFn } from 'ahooks';
import { Button, Empty, Form, Typography, message, theme } from 'antd';
import _ from 'lodash';
import { useRef, useState } from 'react';

import service from '@/service';

const CategoryPage = () => {
  const [form] = Form.useForm();
  const { modal } = useApp();
  const actionRef = useRef<ActionType>();


  const {token} =  theme.useToken();
  

  // 当前选中的店铺ID
  const [currentStoreId, setCurrentStoreId] = useState<number>();
  // 当前选中的店铺名称
  const [currentStoreName, setCurrentStoreName] = useState<string>();

  const openModal = useMemoizedFn((record?: API.IngredientCategory) => {
    // 必须先选择店铺才能新增
    if (!record && !currentStoreId) {
      message.warning('请先选择左侧店铺');
      return;
    }

    modal.openForm({
      form,
      title: record ? '编辑分类' : '新增分类',
      initialValues: {
        ...record,
        storeId: record?.storeId || currentStoreId, // 默认带入当前店铺ID
      },
      width: 500,
      onFinish: async (values) => {
        if (record?.id) {
          await service.caigoufenleiguanli.updateCategory({ ...values, id: record.id });
        } else {
          await service.caigoufenleiguanli.createCategory(values);
        }
        message.success('操作成功');
        actionRef.current?.reload();
        return true;
      },
      content: (
        <>
          {/* 隐藏字段，提交时需要 */}
          <ProFormText name="storeId" hidden />

          <ProFormText name="categoryName" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]} />

          <ProFormTreeSelect
            name="parentId"
            label="上级分类"
            placeholder="留空则为一级分类"
            request={async () => {
              // 这里的 currentStoreId 一定存在，因为新增前校验了，编辑时从 record 获取或 fallback
              const storeId = record?.storeId || currentStoreId;
              if (!storeId) return [];

              const res = await service.caigoufenleiguanli.getCategoryTree({
                storeId,
              });

              // 过滤掉当前正在编辑的节点（防止自己选自己为父节点）
              const filterSelf = (nodes: API.IngredientCategory[]): any[] => {
                return nodes
                  .filter((n) => n.id !== record?.id)
                  .map((n) => ({
                    title: n.categoryName,
                    value: n.id,
                    children: n.children ? filterSelf(n.children) : undefined,
                    disabled: n.id === record?.id,
                  }));
              };
              
              return filterSelf(res || []);
            }}
            fieldProps={{
              fieldNames: { label: 'title', value: 'value', children: 'children' },
              allowClear: true,
            }}
          />

          <ProFormDigit name="sortOrder" label="排序" min={0} fieldProps={{ precision: 0 }} />
        </>
      ),
    });
  });

  const handleDelete = useMemoizedFn((record: API.IngredientCategory) => {
    modal.confirm({
      title: '确认删除该分类吗？',
      content: '删除后如有子分类可能也会受到影响。',
      okType: 'danger',
      onOk: async () => {
        if (record.id) {
          await service.caigoufenleiguanli.deleteCategory({ id: record.id });
          message.success('删除成功');
          actionRef.current?.reload();
        }
      },
    });
  });

  return (
    <ProCard split="vertical">
      <ProCard colSpan="300px" title="店铺列表">
        <ProList<API.Store>
          rowKey="id"
          request={async () => {
            return service.dianpuguanli.getAllStores();
          }}
          onDataSourceChange={(data) => {
           if(_.isArray(data) && data.length > 0) {
            setCurrentStoreId(data[0].id);
            setCurrentStoreName(data[0].storeName);
           }
          }}
          metas={{
            title: {
              dataIndex: 'storeName',
            },
          }}
          onRow={(record) => {
            return {
              onClick: () => {
                setCurrentStoreId(record.id);
                setCurrentStoreName(record.storeName);
                actionRef.current?.reload();
              },
              style: {
                cursor: 'pointer',
                padding: `${token.paddingXS}px ${token.padding}px`,
                backgroundColor: currentStoreId === record.id ? token.colorPrimaryBg : 'transparent',
              },
            };
          }}
        />
      </ProCard>
      <ProCard title={currentStoreName ? `[${currentStoreName}] 的分类管理` : '分类管理'}>
        {currentStoreId ? (
          <CreekTable<API.IngredientCategory, API.getCategoryTreeParams>
            key={currentStoreId} // 关键：storeId 变化时完全重置表格
            actionRef={actionRef}
            rowKey="id"
            pagination={false}
            ghost
            search={false}
            request={() => {
              return service.caigoufenleiguanli.getCategoryTree({
                storeId: currentStoreId,
              });
            }}
            toolBarRender={() => [
              <Button key="add" type="primary" onClick={() => openModal()}>
                新增分类
              </Button>,
            ]}
            columns={[
              {
                title: '分类名称',
                dataIndex: 'categoryName',
              },
              {
                title: '创建时间',
                dataIndex: 'createdAt',
                valueType: 'dateTime',
              },
              {
                title: '操作',
                valueType: 'option',
                render: (_, record) => [
                  <Typography.Link key="edit" onClick={() => openModal(record)}>
                    编辑
                  </Typography.Link>,
                  <Typography.Link key="delete" onClick={() => handleDelete(record)}>
                    删除
                  </Typography.Link>,
                ],
              },
            ]}
          />
        ) : (
          <Empty description="请先选择左侧店铺" style={{ marginTop: 100 }} />
        )}
      </ProCard>
    </ProCard>
  );
};

export default CategoryPage;
