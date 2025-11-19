type TabarConfig = {
  pagePath: string;
  text: string;
};

let cachedTabBarHeight = 0;

export const tabarConfig: TabarConfig[] = [
  {
    pagePath: "pages/home/index",
    text: "首页",
  },
  {
    pagePath: "pages/history/index",
    text: "资产",
  },
  // {
  //   pagePath: "pages/create/category",
  //   text: "新建",
  // },
  {
    pagePath: "pages/order/index",
    text: "订单",
  },
  {
    pagePath: "pages/user/index",
    text: "我的",
  },
];

export const tabSwitcher = (context: any) => {
  const { route } = context;
  if (typeof context.getTabBar === "function" && context.getTabBar()) {
    context.getTabBar().setData({
      selected: tabarConfig.findIndex((item) => item.pagePath === route),
    });
  }
};

export const setCustomTabBarHeight = (height: number) => {
  if (!height || cachedTabBarHeight === height) return;

  cachedTabBarHeight = height;

  // 保存到本地存储
  try {
    wx.setStorageSync("customTabBarHeight", height);
  } catch {
    // ignore: storage might be unavailable during SSR
  }
};

export const getCustomTabBarHeight = (): number => {
  if (cachedTabBarHeight > 0) return cachedTabBarHeight;

  // 从本地存储恢复
  try {
    const persisted = Number(wx.getStorageSync("customTabBarHeight") || 0);
    if (persisted > 0) {
      cachedTabBarHeight = persisted;
      return persisted;
    }
  } catch {
    // ignore: storage unavailable
  }

  return 0;
};
