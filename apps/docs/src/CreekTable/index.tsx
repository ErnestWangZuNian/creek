import { CreekTable } from '@creekjs/web-components';
import { Button, Space, Tag } from 'antd';
import React, { useState } from 'react';

// 模拟假数据
const mockData = Array.from({ length: 50 }).map((_, index) => ({
  id: index + 1,
  name: `测试用户 ${index + 1}`,
  status: index % 3 === 0 ? 'error' : index % 2 === 0 ? 'success' : 'processing',
  role: index % 2 === 0 ? 'Admin' : 'User',
  longText: '这是一段非常非常长的文本，用来测试默认的 ellipsis 省略效果。如果在原生 ProTable 中，这段文本会直接撑破表格的布局，但在 CreekTable 中它会被自动截断，并且鼠标悬浮时会显示完整的 Tooltip。',
  createTime: '2023-10-01 12:00:00',
}));

export default () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120, // 给了宽度的列会自动支持拖拽调整
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        success: { text: '成功', status: 'Success' },
        error: { text: '失败', status: 'Error' },
        processing: { text: '进行中', status: 'Processing' },
      },
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (_: any, record: any) => (
        <Tag color={record.role === 'Admin' ? 'blue' : 'green'}>{record.role}</Tag>
      ),
    },
    {
      title: '超长文本测试',
      dataIndex: 'longText',
      key: 'longText',
      // CreekTable 默认开启了 ellipsis，所以不用写 ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      valueType: 'dateTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      // 这个列我们不写 width，CreekTable 会在底层使用 useAutoWidthColumns 自动测量它里面 DOM 的真实宽度，保证这些按钮永远在一行显示不换行
      render: () => (
        <Space>
          <a>编辑</a>
          <a style={{ color: 'red' }}>删除</a>
          <a>分配权限</a>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* 
        在实际业务组件中，通常父容器是占满屏幕高度的，
        CreekTable 会利用 useTableScrollHeight 自动计算出剩余空间并给内部内容区域设置正确的高度和滚动条。
        这里我们给外层设置一个固定的 height: 600px 模拟屏幕容器。
      */}
      <CreekTable
        headerTitle="用户列表"
        columns={columns}
        request={async (params) => {
          console.log('搜索参数:', params);
          // 模拟网络请求延迟
          await new Promise<void>((resolve) => { setTimeout(resolve, 800); });
          
          const { current = 1, pageSize = 10 } = params;
          const start = (current - 1) * pageSize;
          const end = start + pageSize;
          
          return {
            // CreekTable 内置了类型支持（如 NormalizeResponse），兼容 records, result, list 等常见分页字段
            data: mockData.slice(start, end),
            total: mockData.length,
            success: true,
          };
        }}
        rowKey="id"
        // === 以下是 CreekTable 的核心增强特性配置 ===
        showIndex={true}          // 1. 开启全局连续的序号列 (翻页时序号会自动累加，如第二页从 11 开始)
        resizable={true}          // 2. 开启列宽拖拽（针对配置了 width 的列）
        pageFixedBottom={true}    // 3. 自动计算高度，并将分页器固定在容器底部
        // options={...}          // 4. 默认自带了密度和设置，且 density 默认 'small'
        // =====================================
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        toolBarRender={() => [
          <Button key="add" type="primary">
            新建
          </Button>,
          <Button key="export">导出</Button>,
        ]}
      />
    </div>
  );
};
