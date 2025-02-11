import { Button, ConfigProvider } from '@antmjs/vantui';
import { View } from '@tarojs/components';

import { getStoreService } from '@/testService';

import Taro from '@tarojs/taro';
import './index.less';
function Index() {
  const handleClick = async () => {
    console.log(Taro, 'Taro');
    getStoreService();
  };

  return (
    <ConfigProvider>
      <View>
        <View>232323455</View>
        <Button type="primary" onClick={handleClick}>
          主要按钮
        </Button>
      </View>
    </ConfigProvider>
  );
}

export default Index;
