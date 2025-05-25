import Icon, { createFromIconfontCN } from '@ant-design/icons';
import type { GetProps } from 'antd';
import { isEmpty } from 'lodash';
import { useContext } from 'react';

import { CreekConfigProvider, CreekConfigProviderProps } from '../creek-config-provider';

type CustomIconComponentProps = GetProps<typeof Icon>;

export type CreekIconProps = CustomIconComponentProps & {
  iconFontCNs?: CreekConfigProviderProps['iconFontCNs'];
  type?: string;
  component?: CustomIconComponentProps['component'];
};

export const CreekIcon = (props: CreekIconProps) => {
  const { iconFontCNs: iconFontCNsContext } = useContext(CreekConfigProvider.CreekConfigContext);
  const { component, type, iconFontCNs, ...more } = props;

  const _iconFontCNs = iconFontCNs || iconFontCNsContext;

  if (component) {
    return <Icon component={component} {...more} />;
  }

  if (type && !isEmpty(_iconFontCNs)) {
    const IconFont = createFromIconfontCN({
      scriptUrl: _iconFontCNs,
    });
    return <IconFont type={type} {...more} />;
  }

  return null;
};
