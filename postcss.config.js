export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: [
        'Android >= 4.0',
        'iOS >= 8',
        'Chrome >= 40',
        'Safari >= 8',
        '> 1%',
        'last 2 versions',
      ],
    },
    'postcss-pxtorem': {
      rootValue: 37.5, // 设计稿宽度的1/10，Vant 官方设计稿是 375px
      propList: ['*'], // 需要转换的属性，*表示所有属性
      unitPrecision: 5, // 转换后保留的小数位数
      selectorBlackList: ['.no-rem'], // 不进行rem转换的类名
      replace: true,
      mediaQuery: false, // 是否在媒体查询中也转换px
      minPixelValue: 2, // 设置要替换的最小像素值，小于这个值的不会被转换
      // Vant 组件的样式也需要转换，所以不排除 node_modules
      // 如果遇到其他第三方组件库冲突，可以精确排除特定库
      exclude: /node_modules\/(?!vant)/i,
    },
  },
}
