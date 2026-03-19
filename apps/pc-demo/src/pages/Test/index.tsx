import { Input } from 'antd';

import { CreekPageContainer } from '@creekjs/web-components';

import { useT } from '@/utils/i18n';

export default function Test() {
  const t = useT();

  return (
    <CreekPageContainer>
      <Input placeholder={t('pages.Test.index.qingShuRuCeShiWenZi', '请输入测试文字')} />
    </CreekPageContainer>
  );
}
