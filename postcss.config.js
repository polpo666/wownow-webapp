export default {
  plugins: {
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
      rootValue: 37.5, // 设计稿宽度的1/10，例如设计稿是375px，这里就是37.5
      propList: ['*'], // 需要转换的属性，*表示所有属性
      unitPrecision: 5, // 转换后保留的小数位数
      selectorBlackList: ['.no-rem'], // 不进行rem转换的类名
      replace: true,
      mediaQuery: false, // 是否在媒体查询中也转换px
      minPixelValue: 2, // 设置要替换的最小像素值，小于这个值的不会被转换
      exclude: /node_modules/i, // 排除node_modules文件夹
    },
  },
}
