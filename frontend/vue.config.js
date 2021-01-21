module.exports = {
  devServer: {
    disableHostCheck: true,
  },
  transpileDependencies: [
    'vuetify',
  ],
  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        // eslint-disable-next-line no-param-reassign
        args[0].title = 'Coding Rush';
        return args;
      });
  },
};
