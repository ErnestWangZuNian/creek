import { ColumnHeightOutlined } from '@ant-design/icons';
import { ProTableProps } from '@ant-design/pro-components';
import { Dropdown, MenuProps, Tooltip } from 'antd';
import React from 'react';

export type SizeType = ProTableProps<any, any>['size'];

interface DensityIconProps {
  tableSize: SizeType;
  setTableSize: (size: SizeType) => void;
}

export const DensityIcon: React.FC<DensityIconProps> = ({ tableSize, setTableSize }) => {
  const items: MenuProps['items'] = [
    {
      key: 'large',
      label: '宽松',
      onClick: () => setTableSize('large'),
    },
    {
      key: 'middle',
      label: '中等',
      onClick: () => setTableSize('middle'),
    },
    {
      key: 'small',
      label: '紧凑',
      onClick: () => setTableSize('small'),
    },
  ];

  const getTitle = () => {
    switch (tableSize) {
      case 'large':
        return '表格密度 (宽松)';
      case 'middle':
        return '表格密度 (中等)';
      case 'small':
        return '表格密度 (紧凑)';
      default:
        return '表格密度';
    }
  }

  return (
    <Dropdown
      menu={{
        items,
        selectedKeys: [tableSize || 'large'],
        selectable: true,
      }}
      trigger={['click']}
    >
      <Tooltip title={getTitle()}>
        <ColumnHeightOutlined style={{ fontSize: 16, cursor: 'pointer' }} />
      </Tooltip>
    </Dropdown>
  );
};
