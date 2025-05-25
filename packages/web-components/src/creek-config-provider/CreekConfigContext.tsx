import { createContext } from 'react';


export type CreekConfigContextProps = {
    iconFontCNs?: string[];
}

export const CreekConfigContext = createContext<CreekConfigContextProps>({});