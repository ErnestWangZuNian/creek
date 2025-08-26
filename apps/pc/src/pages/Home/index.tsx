import { CreekIcon, CreekTable } from '@creekjs/web-components';
import { Button } from 'antd';

enum heightEnum {
  'g' = '1.75米',
  'z' = '1.80米',
  'x' = '1.85米',
}

const HomePage = () => {
  return (
    <>
      <CreekIcon />
      {/* <Flex justify="flex-end" flex={1}>
        <CreekSearch
          justify="end"
          columns={[
            {
              dataIndex: 'name',
              title: '姓名',
            },
            {
              dataIndex: 'type',
              title: '类型',
              valueType: 'select',
              valueEnum: {
                student: '学生',
                teacher: '老师',
              },
            },
            {
              dataIndex: 'isCool',
              title: '是否帅气',
              valueType: 'switch',
            },
            {
              dataIndex: 'data',
              title: '日期',
              valueType: 'dateRange',
            },
            {
              dataIndex: 'height',
              title: '身高',
              valueType: 'radio',
              valueEnum: heightEnum,
            },
            {
              dataIndex: 'weight',
              title: '体重',
              onFilter: true,
              filters: true,
              valueEnum: {
                '1.75': '1.75米',
                '1.80': '1.80米',
                '1.85': '1.85米',
              },
            },
          ]}
        />
      </Flex> */}

      <CreekTable
        rowKey="name"
        toolBarRender={() => {
          return [<Button type="primary">新建</Button>, <Button type="primary">编辑</Button>, <Button type="primary">测试</Button>];
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
        dataSource={[
          {
            name: 'user',
            type: 'student',
            isCool: true,
            weight: 1.75,
          },
          {
            name: 'user1',
            type: 'student',
            isCool: true,
            weight: 1.85,
          },
        ]}
        columns={[
          {
            dataIndex: 'name',
            title: '姓名',
          },
          {
            dataIndex: 'type',
            title: '类型',
            valueType: 'select',
            valueEnum: {
              student: '学生',
              teacher: '老师',
            },
          },
          {
            dataIndex: 'isCool',
            title: '是否帅气',
            valueType: 'switch',
          },
          {
            dataIndex: 'data',
            title: '日期',
            valueType: 'dateRange',
          },
          {
            dataIndex: 'height',
            title: '身高',
            valueType: 'radio',
            search: false,
            valueEnum: heightEnum,
          },
          {
            dataIndex: 'weight',
            title: '体重',
            valueType: 'checkbox',
            search: false,
            valueEnum: {
              '1.75': '1.75米',
              '1.80': '1.80米',
              '1.85': '1.85米',
            },
          },
        ]}
      />

      {/* <ProTable
        dataSource={[
          {
            name: 'user',
            type: 'student',
            isCool: true,
          },
        ]}
        columns={[
          {
            dataIndex: 'name',
            title: '姓名',
          },
          {
            dataIndex: 'type',
            title: '类型',
            valueType: 'select',
            valueEnum: {
              student: '学生',
              teacher: '老师',
            },
          },
          {
            dataIndex: 'isCool',
            title: '是否帅气',
            valueType: 'switch',
          },
          {
            dataIndex: 'data',
            title: '日期',
            valueType: 'dateTimeRange',
          },
          {
            dataIndex: 'height',
            title: '身高',
            valueType: 'radio',
            valueEnum: heightEnum,
          },
          {
            dataIndex: 'weight',
            title: '体重',
            valueType: 'checkbox',
            valueEnum: {
              '1.75': '1.75米',
              '1.80': '1.80米',
              '1.85': '1.85米',
            },
          },
        ]}
      /> */}
    </>
  );
};

export default HomePage;
