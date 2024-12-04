import { userLruCache } from '@/storage';
import { Button } from 'antd';

const HomePage: React.FC = () => {
  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          userLruCache.set("user", {name: 'wzn', age: 29})
        }}
      >
        点我存数据
      </Button>

    </>
  );
};
export default HomePage;
