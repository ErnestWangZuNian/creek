import { ProFormText } from '@ant-design/pro-components';
import { CreekConfigProvider, useApp } from '@creekjs/web-components';
import { Button, Card, Space, message } from 'antd';
import React from 'react';

const DemoContent = () => {
  const { modal, drawer } = useApp();

  const handleOpenNormalModal = () => {
    modal.open({
      title: '普通的提示弹窗',
      content: (
        <div style={{ padding: '24px 0' }}>
          这是一个普通的弹窗，你可以传入任何 ReactNode 作为 content。
          <br />
          注意，我们没有在这个组件里写任何的 <code>[isOpen, setIsOpen]</code> 状态！
        </div>
      ),
      onOk: () => {
        message.success('点击了确定');
        modal.close();
      },
    });
  };

  const handleOpenFormDrawer = () => {
    drawer.openForm({
      title: '新建用户',
      width: 400,
      content: (
        <>
          <ProFormText name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]} />
          <ProFormText name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]} />
        </>
      ),
      onFinish: async (values) => {
        console.log('表单提交:', values);
        message.success('提交成功！抽屉将自动关闭。');
        // 返回 true 会自动关闭抽屉
        return true;
      },
    });
  };

  return (
    <Card title="命令式弹窗与抽屉演示" bordered={false}>
      <Space>
        <Button type="primary" onClick={handleOpenNormalModal}>
          打开普通弹窗
        </Button>
        <Button onClick={handleOpenFormDrawer}>
          打开表单抽屉 (DrawerForm)
        </Button>
      </Space>
    </Card>
  );
};

class ErrorBoundary extends React.Component<any, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: 20 }}>
        <h2>Something went wrong.</h2>
        <pre>{this.state.error?.toString()}</pre>
        <pre>{this.state.error?.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

export default () => {
  return (
    <ErrorBoundary>
      <CreekConfigProvider>
        <DemoContent />
      </CreekConfigProvider>
    </ErrorBoundary>
  );
};