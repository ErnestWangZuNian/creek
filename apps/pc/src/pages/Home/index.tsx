import { Button } from 'antd';

const store = require('store.js');

const HomePage: React.FC = () => {
  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          store.set("user", {name: 'wzn'})
        }}
      >
        点我存数据
      </Button>

    </>
  );
};
export default HomePage;
