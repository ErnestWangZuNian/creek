import { Button } from 'antd';
import { useEffect } from 'react';

import { getStoreIdService, getStoreService } from '@/testService';

const HomePage: React.FC = () => {
  useEffect(() => {
    getStoreService();
    getStoreIdService();
  });

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
