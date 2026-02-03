import { IApi } from 'umi';

export default (api: IApi) => {
  return {
    plugins: [
      require.resolve('./creek-layout'),
      require.resolve('./open-api'),
    ],
  };
};
