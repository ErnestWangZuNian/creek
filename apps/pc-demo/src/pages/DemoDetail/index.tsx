import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Descriptions, Divider, Space, Tag, Typography } from 'antd';
import { useNavigate, useSearchParams, useParams } from 'umi';

import { CreekPageContainer } from '@creekjs/web-components';

import { useT } from '@/utils/i18n';

const statusMap: Record<string, { color: string; text: string }> = {
  available: { color: 'success', text: 'Available' },
  pending: { color: 'processing', text: 'Pending' },
  sold: { color: 'error', text: 'Sold' },
};

export default function PetDetail() {
  const t = useT();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const id = params.id;
  const name = searchParams.get('name') || 'Unknown';
  const status = searchParams.get('status') || 'available';

  const statusInfo = statusMap[status] || statusMap.available;

  return (
    <CreekPageContainer>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')}>
          {t('pages.DemoDetail.index.fanHuiLieBiao', '返回列表')}
        </Button>
      </div>

      <Typography.Title level={4} style={{ marginBottom: 24 }}>
        {name}
      </Typography.Title>

      <Descriptions column={2} bordered>
        <Descriptions.Item label={t('pages.DemoDetail.index.ID', 'ID')}>{id}</Descriptions.Item>
        <Descriptions.Item label={t('pages.DemoDetail.index.mingCheng', '名称')}>{name}</Descriptions.Item>
        <Descriptions.Item label={t('pages.DemoDetail.index.zhuangTai', '状态')}>
          <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('pages.DemoDetail.index.fenLei', '分类')}>
          {searchParams.get('category') || 'Pet'}
        </Descriptions.Item>
        <Descriptions.Item label={t('pages.DemoDetail.index.biaoQian', '标签')}>
          <Space>
            <Tag>tag1</Tag>
            <Tag>tag2</Tag>
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label={t('pages.DemoDetail.index.chuangJianShiJian', '创建时间')} span={2}>
          2024-01-01 12:00:00
        </Descriptions.Item>
        <Descriptions.Item label={t('pages.DemoDetail.index.beiZhu', '备注')} span={2}>
          <Typography.Text type="secondary">
            {t('pages.DemoDetail.index.wuBeiZhuXinXi', '无备注信息')}
          </Typography.Text>
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Space>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate('/home')}>
          {t('pages.DemoDetail.index.bianJi', '编辑')}
        </Button>
      </Space>
    </CreekPageContainer>
  );
}
