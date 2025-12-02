import { CreekIcon, CreekTable } from '@creekjs/web-components';
import { useSafeState } from 'ahooks';
import { Button } from 'antd';
import { useEffect } from 'react';

enum heightEnum {
  'g' = '1.75米',
  'z' = '1.80米',
  'x' = '1.85米',
}

const HomePage = () => {

  const [visible, setVisible] = useSafeState(false);

  useEffect(() => {
    if (visible) {
    console.log('1111')
    }
  }, []);

  return (
    <>
      <CreekIcon />

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
    </>
  );
};

export default HomePage;
