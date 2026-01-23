import StoreList from '@/components/StoreList';
import service from '@/service';
import { ActionType, ProCard, ProFormText, ProFormTreeSelect } from '@ant-design/pro-components';
import { CreekTable, useApp } from '@creekjs/web-components';
import { useMemoizedFn } from 'ahooks';
import { Button, Empty, Form, Typography, message } from 'antd';
import { useRef, useState } from 'react';

const IngredientsPage = () => {
  const [form] = Form.useForm();
  const { modal } = useApp();
  const actionRef = useRef<ActionType>();

  // 当前选中的店铺ID
  const [currentStoreId, setCurrentStoreId] = useState<number>();
  // 当前选中的店铺名称
  const [currentStoreName, setCurrentStoreName] = useState<string>();

  const openModal = useMemoizedFn((record?: API.Ingredients) => {
    // 必须先选择店铺才能新增
    if (!record && !currentStoreId) {
      message.warning('请先选择左侧店铺');
      return;
    }

    modal.openForm({
      form,
      title: record ? '编辑物品' : '新增物品',
      initialValues: {
        ...record,
        storeId: record?.storeId || currentStoreId, // 默认带入当前店铺ID
      },
      width: 500,
      onFinish: async (values) => {
        if (record?.id) {
          await service.ingredientsController.updateIngredient({ ...values, id: record.id });
        } else {
          await service.ingredientsController.addIngredient(values);
        }
        message.success('操作成功');
        actionRef.current?.reload();
        return true;
      },
      content: (
        <>
          {/* 隐藏字段，提交时需要 */}
          <ProFormText name="storeId" hidden />

          <ProFormText name="name" label="物品名称" rules={[{ required: true, message: '请输入物品名称' }]} />

          <ProFormTreeSelect
            name="categoryId"
            label="所属分类"
            placeholder="请选择分类"
            rules={[{ required: true, message: '请选择分类' }]}
            request={async () => {
              const storeId = record?.storeId || currentStoreId;
              if (!storeId) return [];

              const res = (await service.caigoufenleiguanli.getCategoryTree({
                storeId,
              })) as unknown as API.IngredientCategory[];

              const mapTree = (nodes: API.IngredientCategory[]): any[] => {
                return nodes.map((n) => ({
                  title: n.categoryName,
                  value: n.id,
                  children: n.children ? mapTree(n.children) : undefined,
                }));
              };
              return mapTree(res || []);
            }}
            fieldProps={{
              fieldNames: { label: 'title', value: 'value', children: 'children' },
              allowClear: true,
              treeDefaultExpandAll: true,
            }}
          />

          <ProFormText name="unit" label="单位" placeholder="请输入单位（如：kg, 斤, 个）" rules={[{ required: true, message: '请输入单位' }]} />
        </>
      ),
    });
  });

  const handleDelete = useMemoizedFn((record: API.Ingredients) => {
    modal.confirm({
      title: '确认删除该物品吗？',
      okType: 'danger',
      onOk: async () => {
        if (record.id) {
          await service.ingredientsController.deleteIngredient({ id: record.id });
          message.success('删除成功');
          actionRef.current?.reload();
        }
      },
    });
  });

  return (
    <ProCard split="vertical">
      <ProCard colSpan="300px" title="店铺列表">
        <StoreList
          value={currentStoreId}
          onChange={(storeId, store) => {
            setCurrentStoreId(storeId);
            setCurrentStoreName(store.storeName);
          }}
        />
      </ProCard>
      <ProCard title={currentStoreName ? `[${currentStoreName}] 的采购物品管理` : '采购物品管理'}>
        {currentStoreId ? (
          <CreekTable
            key={currentStoreId}
            actionRef={actionRef}
            rowKey="id"
            request={() => {
              return service.ingredientsController.getByStore({
                storeId: currentStoreId,
              });
            }}
            toolBarRender={() => [
              <Button key="add" type="primary" onClick={() => openModal()}>
                新增物品
              </Button>,
            ]}
            columns={[
              {
                title: '物品名称',
                dataIndex: 'name',
              },
              {
                title: '所属分类',
                dataIndex: 'categoryId',
                valueType: 'select',
                request: async () => {
                  if (!currentStoreId) return [];
                  const res = (await service.caigoufenleiguanli.getCategoryTree({
                    storeId: currentStoreId,
                  })) as unknown as API.IngredientCategory[];

                  // Flatten tree to get valueEnum
                  const options: { label: string; value: number }[] = [];
                  const traverse = (nodes: API.IngredientCategory[]) => {
                    nodes.forEach((node) => {
                      if (node.id && node.categoryName) {
                        options.push({ label: node.categoryName, value: node.id });
                      }
                      if (node.children) {
                        traverse(node.children);
                      }
                    });
                  };
                  traverse(res || []);
                  return options;
                },
              },
              {
                title: '单位',
                dataIndex: 'unit',
              },
              {
                title: '创建时间',
                dataIndex: 'createdAt',
                valueType: 'dateTime',
                width: 180,
              },
              {
                title: '操作',
                valueType: 'option',
                width: 150,
                render: (_, record) => [
                  <Typography.Link key="edit" onClick={() => openModal(record)}>
                    编辑
                  </Typography.Link>,
                  <Typography.Link key="delete" type="danger" onClick={() => handleDelete(record)}>
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

export default IngredientsPage;
