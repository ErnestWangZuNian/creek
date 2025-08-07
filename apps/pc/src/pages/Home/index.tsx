import { CreekIcon, CreekTable } from '@creek/web-components';
import { Button } from 'antd';

const HomePage = () => {
  return (
    <>
      <CreekIcon />
      <CreekTable
        rowKey="name"
        toolBarRender={() => {
          return [<Button type="primary">新建</Button>, <Button type="primary">编辑</Button>, <Button type="primary">测试</Button>];
        }}
        dataSource={[
          {
            name: 'user',
          },
        ]}
        columns={[
          {
            dataIndex: 'name',
            title: '姓名',
          },
        ]}
      />
    </>
  );
};

export default HomePage;
