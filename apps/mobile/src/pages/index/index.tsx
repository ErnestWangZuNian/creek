import { Button, ConfigProvider } from "@antmjs/vantui";
import { View } from '@tarojs/components';

import { getStoreService } from '@/testService';

import Taro from "@tarojs/taro";
import './index.less';
function Index() {

  const handleClick = async () => {
    console.log(Taro, 'Taro');
    getStoreService();
  };

  return (
    <ConfigProvider>
      <View className='nutui-react-demo'>
        <Button type="primary" onClick={handleClick}>点我开启taro之旅</Button>
      </View>
    </ConfigProvider>
  )
}

export default Index
