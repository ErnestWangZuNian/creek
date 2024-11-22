import Icon, { createFromIconfontCN } from '@ant-design/icons';
import type { GetProps } from 'antd';
import { isEmpty } from 'lodash';
import { useContext } from 'react';

import { CreekConfigProvider, CreekConfigProviderProps } from '../creek-config-provider';

type CustomIconComponentProps = GetProps<typeof Icon>;

export type CreekIconProps = CustomIconComponentProps & {
  iconfontCNs?: CreekConfigProviderProps['iconfontCNs'];
  type?: string;
  component?: CustomIconComponentProps['component'];
};

export const CreekIcon = (props: CreekIconProps) => {
  const { iconfontCNs: iconfontCNsContext } = useContext(CreekConfigProvider.CreekConfigContext);
  const { component, type, iconfontCNs, ...more } = props;

  const _iconfontCNs = iconfontCNs || iconfontCNsContext;

  if (component) {
    return <Icon component={component} {...more} />;
  }

  if (type && !isEmpty(_iconfontCNs)) {
    const IconFont = createFromIconfontCN({
      scriptUrl: _iconfontCNs,
    });
    return <IconFont type={type} {...more} />;
  }

  return null;
};
