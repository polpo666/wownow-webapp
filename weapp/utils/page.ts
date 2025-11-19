import { getCustomTabBarHeight } from "@/custom-tab-bar/tabbar";

const getCurrentPageRoute = () => {
  try {
    const pages = getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      let route = currentPage.route || '';
      
      // 确保路由以 / 开头
      if (route && !route.startsWith('/')) {
        route = '/' + route;
      }
      
      return route;
    }
  } catch (error) {
    console.warn('获取页面路由失败:', error);
  }
  return '';
};

const getScrollContentHeight = () => {
  const windowInfo = wx.getWindowInfo();
  const tabBarHeight = getCustomTabBarHeight();
  const contentMinHeight = Math.max(windowInfo.windowHeight - tabBarHeight, 0);
  return contentMinHeight;
}

export { getCurrentPageRoute, getScrollContentHeight };