import { userStore } from '@/storage';
import { getStoreService } from '@/testService';
import { PageContainer } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { Button } from 'antd';

const AccessPage: React.FC = () => {
  const access = useAccess();
  return (
    <PageContainer
      ghost
      header={{
        title: '权限示例',
      }}
    >
      <Access accessible={access.canSeeAdmin}>
        <Button>只有 Admin 可以看到这个按钮</Button>
      </Access>
      <Button
        type="primary"
        onClick={async () => {
            await getStoreService();
          const a = userStore.get('user');
          console.log(a, '1111');
        }}
      >
        点我取数据
      </Button>
    </PageContainer>
  );
};

export default AccessPage;
