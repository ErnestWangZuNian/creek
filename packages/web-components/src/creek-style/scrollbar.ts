import { createGlobalStyle } from 'antd-style';

export const GlobalScrollbarStyle = createGlobalStyle(({ theme: token }) => {
  return {
    '*': {
      scrollbarWidth: 'thin',
      scrollbarColor: `${token.colorFillSecondary} transparent !important`,
    },
    /* Webkit (Chrome, Safari, Edge) 滚动条样式 */
    '& *::-webkit-scrollbar': {
      width: '6px !important',
      height: '6px !important',
      backgroundColor: 'transparent !important',
    },

    '& *::-webkit-scrollbar-thumb': {
      backgroundColor: `${token.colorFillSecondary} !important`,
      borderRadius: '3px !important',
      transition: 'all 0.3s',
      '&:hover': {
        backgroundColor: `${token.colorFill} !important`,
      },
    },

    '& *::-webkit-scrollbar-track': {
      backgroundColor: 'transparent !important',
    },
  };
});
