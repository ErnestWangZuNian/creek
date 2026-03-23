import { ParamsType, ProTableProps } from '@ant-design/pro-components';

export type OptionRenderCustom = {
  text?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};

export type CreekTableProps<T extends ParamsType, U extends ParamsType, ValueType = 'text'> = ProTableProps<T, U, ValueType> & {
  pageFixedBottom?: boolean; // 是否固定分页在底部
  pageFixedBottomConfig?: {
    /** 底部保留空间（如固定在底部的元素高度），默认 0 */
    bottomFix?: number;
  };
  // 是否显示序号列，默认 true
  showIndex?: boolean;
  /** 是否可拖动列宽，默认 true */
  resizable?: boolean;
};
