import service from '@/service';
import { ProList } from '@ant-design/pro-components';
import { theme } from 'antd';
import _ from 'lodash';
import React, { useState } from 'react';

export interface StoreListProps {
  value?: number;
  onChange?: (storeId: number, store: API.Store) => void;
}

const StoreList: React.FC<StoreListProps> = ({ value, onChange }) => {
  const { token } = theme.useToken();
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  return (
    <ProList<API.Store>
      rowKey="id"
      request={async () => {
        const res = (await service.dianpuguanli.getAllStores()) as unknown as API.Store[];
        return {
          data: res,
          success: true,
        };
      }}
      onDataSourceChange={(data) => {
        if (!hasAutoSelected && _.isArray(data) && data.length > 0) {
          const firstStore = data[0];
          if (firstStore.id) {
            onChange?.(firstStore.id, firstStore);
            setHasAutoSelected(true);
          }
        }
      }}
      metas={{
        title: {
          dataIndex: 'storeName',
        },
      }}
      onRow={(record) => {
        return {
          onClick: () => {
            if (record.id) {
              onChange?.(record.id, record);
            }
          },
          style: {
            cursor: 'pointer',
            padding: `${token.paddingXS}px ${token.padding}px`,
            backgroundColor: value === record.id ? token.colorPrimaryBg : 'transparent',
            borderRadius: token.borderRadius,
            transition: 'all 0.3s',
          },
        };
      }}
    />
  );
};

export default StoreList;
