import { userStore } from '@/storage';
import { Button } from 'antd';

const HomePage: React.FC = () => {
  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          userStore.set("user", 'wzn')
        }}
      >
        点我存数据
      </Button>

    </>
  );
};
export default HomePage;
