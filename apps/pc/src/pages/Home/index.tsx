import { Button } from 'antd';

import { getStoreService } from '@/testService';

const HomePage = () => {

  const handleStoreData = async () => {
    try {
      await getStoreService();
    } catch (error) {
      console.log(error, 'error');
    }
  };

  return (
    <>
      <Button type="primary" onClick={handleStoreData}>
        点我存数据
      </Button>
    </>
  );
};

export default HomePage;
