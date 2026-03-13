import { Input } from 'antd';

import { useT } from '@/utils/i18n';

export default function Test() {
  const t = useT();
  return <Input placeholder={t('pages.Test.index.qingShuRuCeShiWenZi', '请输入测试文字')} />;
}
