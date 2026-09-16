export default {
  plugins: {
    'postcss-px-to-viewport': {
      viewportWidth: 1242, // 设计稿宽度，750px 为设计图标准
      unitPrecision: 5,
      viewportUnit: 'vw',
      selectorBlackList: ['.pc'], // PC端和 vant 组件不转换 px
      minPixelValue: 1,
      mediaQuery: false,
      exclude: [/node_modules\/vant/], // 排除 vant 的文件路径
    },
  },
};
