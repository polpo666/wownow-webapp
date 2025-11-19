/**
 * 移动端适配工具函数
 * 根据屏幕宽度动态设置根元素的font-size
 * 配合postcss-pxtorem使用
 */

// 设计稿宽度
const DESIGN_WIDTH = 375
// 设计稿宽度对应的根字体大小
const BASE_FONT_SIZE = 37.5

// 设置rem函数
function setRem() {
  // 获取当前窗口宽度
  const clientWidth = document.documentElement.clientWidth || window.innerWidth

  // 计算缩放比例
  // 限制最大宽度为750px，避免在大屏设备上字体过大
  const scale = Math.min(clientWidth / DESIGN_WIDTH, 2)

  // 设置根元素字体大小
  document.documentElement.style.fontSize = BASE_FONT_SIZE * scale + 'px'
}

// 初始化
setRem()

// 监听窗口大小变化
window.addEventListener('resize', setRem)

// 监听页面显示事件（处理移动端浏览器的特殊情况）
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    setRem()
  }
})

// 设置body字体大小，避免继承根元素的font-size
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.fontSize = '14px'
})

export { setRem, DESIGN_WIDTH, BASE_FONT_SIZE }
