import { ExportOutlined, ImportOutlined } from '@ant-design/icons';
import { ParamsType } from '@ant-design/pro-components';
import { Space, Tooltip } from 'antd';
import { createStyles } from 'antd-style';

import { OptionRenderCustom } from './type';

const useStyles = createStyles(({ prefixCls, token }) => {
  return {
    'table-option-render-item': {
      border: `1px solid ${token.colorBorder}`,
      borderRadius: token.borderRadius,
      padding: '8px',
      cursor: 'pointer',
    },
  };
});

export type TableOptionRenderProps<T extends ParamsType, U extends ParamsType, ValueType = 'text'> = {
  defaultDom?: React.ReactNode[];
  importConfig?: OptionRenderCustom;
  exportConfig?: OptionRenderCustom;
};

export const TableOptionRender = <T extends ParamsType, U extends ParamsType, ValueType = 'text'>(props: TableOptionRenderProps<T, U, ValueType>) => {
  const { defaultDom, importConfig, exportConfig } = props;

  const { styles } = useStyles();

  const [reload, dis, setting] = defaultDom || [];
  return (
    <Space size={8}>
      {importConfig && (
        <span
          className={styles['table-option-render-item']}
          onClick={() => {
            importConfig.onClick?.();
          }}
        >
          <Tooltip title={importConfig.text || '导入'}>{importConfig.icon || <ImportOutlined />}</Tooltip>
        </span>
      )}
      {exportConfig && (
        <span
          className={styles['table-option-render-item']}
          onClick={() => {
            exportConfig.onClick?.();
          }}
        >
          <Tooltip title={exportConfig.text || '导出'}>{exportConfig.icon || <ExportOutlined />}</Tooltip>
        </span>
      )}
      <span className={styles['table-option-render-item']}>{reload}</span>
      <span className={styles['table-option-render-item']}>{setting}</span>
    </Space>
  );
};
