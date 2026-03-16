import { createContext } from 'react';

export type CreekConfigContextProps = {
  iconFontCNs?: string[];
  /**
   * 国际化语言包
   */
  locale?: Record<string, string>;
};

export const CreekConfigContext = createContext<CreekConfigContextProps>({});
