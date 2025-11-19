import { defineStore } from "@mpxjs/pinia";
import mpx from "@mpxjs/core";
import { getCurrentPageRoute } from "@/utils/page";
import { refreshToken } from "@/api/auth";
import { User } from "@/types";

const clearStoredAuth = () => {
  const keys = ["token", "user", "expireAt", "isLoggedIn"];
  keys.forEach(key => mpx.removeStorageSync(key));
};

const loadAuthState = () => {
  const token = mpx.getStorageSync("token") || '';
  const user = mpx.getStorageSync("user") || null;
  const expireAt = mpx.getStorageSync("expireAt") || null;
  const isLoggedIn = mpx.getStorageSync("isLoggedIn") ? true : false;

  if (!token) {
    return { isLoggedIn: false, token: "", user: null, expireAt: null };
  }

  if (typeof expireAt === "number" && Date.now() > expireAt) {
    clearStoredAuth();
    wx.showToast({ title: "登录已过期，请重新登录", icon: "none" });
    return { isLoggedIn: false, token: "", user: null, expireAt: null };
  }

  return { isLoggedIn, token, user, expireAt };
};

interface AuthStoreState {
  isLoggedIn: boolean;
  token: string;
  user: User | null;
  showLoginModal: boolean;
  currentLoginPage: string | null;
  expireAt: number | null;
  isRefreshingToken: boolean; // 防止递归刷新token
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthStoreState => {
    const authData = loadAuthState();
    return {
      ...authData,
      showLoginModal: false,
      currentLoginPage: null,
      isRefreshingToken: false
    };
  },
  getters: {
    isAuthenticated(state) {
      return state.isLoggedIn;
    },
    hasExpired(state) {
      return typeof state.expireAt === "number" && Date.now() > state.expireAt;
    },
    currentUser(state) {
      return state.user;
    },
  },
  actions: {
    setLoginStatus(status: boolean) {
      this.isLoggedIn = status;
    },
    setUser(user: User) {
      this.user = user;
    },
    setToken(token: string) {
      this.token = token;
    },
    setExpireAt(expireAt: number) {
      this.expireAt = expireAt;
    },
    setShowLoginModal(show: boolean) {
       if (show) {
        if (this.isLoggedIn && mpx.getStorageSync("token")) {
          wx.showToast({ title: '你已经登录了', icon: 'none' });
          return;
        }
        
        // 自动获取当前页面
        const targetPage = getCurrentPageRoute();
        
        this.currentLoginPage = targetPage;
        this.showLoginModal = true;
      } else {
        this.currentLoginPage = null;
        this.showLoginModal = false;
      }
    },
    login(payload: { user: User; token: string; expiresIn: number }) {
      const expireAt = Date.now() + payload.expiresIn * 1000; // 过期时间戳（当前时间 + 过期秒数）

      this.isLoggedIn = true;
      this.user = payload.user;
      this.token = payload.token;
      this.expireAt = expireAt;

      mpx.setStorageSync("expireAt", expireAt);
      mpx.setStorageSync("isLoggedIn", true);
      mpx.setStorageSync("token", payload.token);
      mpx.setStorageSync("user", payload.user);
    },
    logout() {
      this.isLoggedIn = false;
      this.user = null;
      this.token = "";
      this.expireAt = null;
      clearStoredAuth();
    },

    updateUserInfo(userInfo: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...userInfo };
        mpx.setStorageSync("user", this.user);
      }
    },

    checkAndLogoutIfExpired(): boolean {
      if (!this.token || !this.hasExpired) {
        return false;
      }
      this.logout();
      wx.showToast({ title: "登录已过期，请重新登录", icon: "none" });
      return true;
    },

    isTokenExpiringSoon(): boolean {
      if (!this.token || !this.expireAt) {
        return false;
      }
      const now = Date.now();
      return (this.expireAt - now) < 5 * 60 * 1000; // 5分钟
    },
    
    async refreshTokenIfNeeded() {
      if (this.isRefreshingToken || !this.isTokenExpiringSoon()) {
        return;
      }
      this.isRefreshingToken = true;
      try {
        const response = await refreshToken();
        if (response.code === 0 && response.data) {
          const newExpireTime = Date.now() + response.data.expires_in * 1000;
          this.token = response.data.token;
          this.expireAt = newExpireTime;
          mpx.setStorageSync("token", response.data.token);
          mpx.setStorageSync("expireAt", newExpireTime);
        }
      } catch (error) {
        console.warn('Token刷新失败:', error);
      } finally {
        this.isRefreshingToken = false;
      }
    }
  },
});
