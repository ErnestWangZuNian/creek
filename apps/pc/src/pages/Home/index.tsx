import { Button } from 'antd';

import { getStoreService } from '@/testService';

const HomePage: React.FC = () => {
  return (
    <>
      <Button
        type="primary"
        onClick={async () => {
          try {
            await getStoreService();
          } catch (error) {
            console.log(error, 'error');
          }
        }}
      >
        点我存数据
      </Button>
    </>
  );
};
export default HomePage;
