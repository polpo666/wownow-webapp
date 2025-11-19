/**
 * Tabbar 配置
 */

export interface TabbarItem {
  path: string
  name: string
  text: string
  icon?: string
  activeIcon?: string
  isSpecial?: boolean // 特殊样式的标签（如中间的创建按钮）
}

export const tabbarConfig: TabbarItem[] = [
  {
    path: '/home',
    name: 'home',
    text: '首页',
  },
  {
    path: '/assets',
    name: 'assets',
    text: '资产',
  },
  {
    path: '/create',
    name: 'create',
    text: '新建',
    isSpecial: true, // 标记为特殊样式
  },
  {
    path: '/order',
    name: 'order',
    text: '订单',
  },
  {
    path: '/user',
    name: 'user',
    text: '我的',
  },
]

/**
 * 判断路径是否需要显示 Tabbar
 */
export const shouldShowTabbar = (path: string): boolean => {
  return tabbarConfig.some((item) => item.path === path)
}

/**
 * 根据路径获取激活的标签索引
 */
export const getActiveTabIndex = (path: string): number => {
  return tabbarConfig.findIndex((item) => item.path === path)
}
