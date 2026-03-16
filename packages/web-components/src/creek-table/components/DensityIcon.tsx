import { ColumnHeightOutlined } from '@ant-design/icons';
import { ProTableProps } from '@ant-design/pro-components';
import { Dropdown, MenuProps, Tooltip } from 'antd';
import React from 'react';

import { useT } from '@/utils/i18n';

export type SizeType = ProTableProps<any, any>['size'];

interface DensityIconProps {
  tableSize: SizeType;
  setTableSize: (size: SizeType) => void;
}

export const DensityIcon: React.FC<DensityIconProps> = ({ tableSize, setTableSize }) => {
  const t = useT();

  const items: MenuProps['items'] = [
    {
      key: 'large',
      label: t('creek-table.components.DensityIcon.kuanSong', '宽松'),
      onClick: () => setTableSize('large'),
    },
    {
      key: 'middle',
      label: t('creek-table.components.DensityIcon.zhongDeng', '中等'),
      onClick: () => setTableSize('middle'),
    },
    {
      key: 'small',
      label: t('creek-table.components.DensityIcon.jinCou', '紧凑'),
      onClick: () => setTableSize('small'),
    },
  ];

  const getTitle = () => {
    switch (tableSize) {
      case 'large':
        return t('creek-table.components.DensityIcon.biaoGeMiDu(KuanSong)', '表格密度 (宽松)');
      case 'middle':
        return t('creek-table.components.DensityIcon.biaoGeMiDu(ZhongDeng)', '表格密度 (中等)');
      case 'small':
        return t('creek-table.components.DensityIcon.biaoGeMiDu(JinCou)', '表格密度 (紧凑)');
      default:
        return t('creek-table.components.DensityIcon.biaoGeMiDu', '表格密度');
    }
  };

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
