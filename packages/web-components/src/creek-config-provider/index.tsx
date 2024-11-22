import { CreekConfigContext, CreekConfigContextProps } from './CreekConfigContext';

export type CreekConfigProviderProps = CreekConfigContextProps & {
  children?: React.ReactNode;
};

export const CreekConfigProvider = (props: CreekConfigProviderProps) => {
  const { children, ...more } = props;
  return <CreekConfigContext.Provider value={more}>{children}</CreekConfigContext.Provider>;
};

CreekConfigProvider.CreekConfigContext = CreekConfigContext;
