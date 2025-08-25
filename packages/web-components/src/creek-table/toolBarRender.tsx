import { DownOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';

export const toolBarRender = (options: { shouldCollapse: boolean; restProps: any }) => {
  const { shouldCollapse, restProps } = options;

  const baseActions = restProps.toolBarRender?.() || [];
  if (!shouldCollapse || baseActions.length <= 1) {
    return baseActions;
  }

  const [first, ...rest] = baseActions;

  return [
    first,
    <Dropdown
      key="more"
      menu={{
        items: rest.map((item: React.ReactDOM, index: number) => ({ key: index, label: item })),
      }}
      trigger={['click']}
    >
      <Button>
        更多 <DownOutlined />
      </Button>
    </Dropdown>,
  ];
};
