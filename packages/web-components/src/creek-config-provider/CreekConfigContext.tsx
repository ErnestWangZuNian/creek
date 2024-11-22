import { createContext } from 'react';


export type CreekConfigContextProps = {
    iconfontCNs?: string[];
}

export const CreekConfigContext = createContext<CreekConfigContextProps>({});