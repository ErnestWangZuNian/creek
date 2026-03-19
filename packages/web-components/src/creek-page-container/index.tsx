import { PageContainer, PageContainerProps } from '@ant-design/pro-components';
import { createStyles } from 'antd-style';
import React from 'react';

import classnames from 'classnames';

const useStyles = createStyles(({ token }) => ({
  container: {
    padding: token.padding,
  },
}));

export type CreekPageContainerProps = PageContainerProps;

export const CreekPageContainer: React.FC<CreekPageContainerProps> = (props) => {
  const { header, className, children, ...rest } = props;
  const { styles } = useStyles();

  return (
    <PageContainer
      header={{
        title: null, // 默认没有标题
        breadcrumb: {}, // 保留面包屑配置能力
        ...header, // 允许外部覆盖
      }}
      className={classnames(styles.container, className)}
      {...rest}
    >
      {children}
    </PageContainer>
  );
};
