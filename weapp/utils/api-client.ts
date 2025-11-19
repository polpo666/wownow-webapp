import { WOWNOW_API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/auth";
import mpx from "@mpxjs/core";
import mpxFetch, { PreCacheOption } from "../utils/fetch/index.js";
mpx.use(mpxFetch);


// 通用 API 客户端
export interface APIResponse<T> {
  code: number;
  message: string;
  data?: T;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>; // 添加 params 支持
  skipAuth?: boolean;
  usePre?: PreCacheOption<any>;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL = "") {
    this.baseURL = baseURL;
  }

  // 辅助方法：构建查询字符串
  private buildQueryString(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : "";
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      params,
      usePre,
      skipAuth = false,
    } = options;

    // 如果需要认证，先检查登录状态并尝试刷新token
    if (!skipAuth) {
      const authStore = useAuthStore();
      if (authStore.checkAndLogoutIfExpired()) {
        throw new Error("Token expired");
      } else {
        await authStore.refreshTokenIfNeeded();
      }
    }

    const token = !skipAuth ? mpx.getStorageSync("token") : undefined;

    const config: any = {
      method,
      params,
      header: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    };

    if (body) {
      config.data = JSON.stringify(body);
    }
    const url = `${this.baseURL}${endpoint}`;
    const response = await mpx.xfetch.fetch({
      url,
      ...config,
      usePre: usePre || {},
    });
    const data: APIResponse<T> = response.data as APIResponse<T>;

    if (response.statusCode !== 200) {
      throw new Error(
        data.message || `API request failed: ${response.statusCode}`
      );
    }

    if (data.code === 401) {
      // if unauthorized, clear token
      useAuthStore().logout();
      wx.showToast({
        title: "登录已过期，请重新登录",
        icon: "none",
        duration: 2000,
      });
    }
    return data;
  }

  // 便捷方法 - 修改 get 方法支持 params
  async get<T>(
    endpoint: string,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, any>;
      usePre?: PreCacheOption<any>;
      skipAuth?: boolean;
    }
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", ...options });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>,
    skipAuth?: boolean
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body,
      headers,
      skipAuth,
    });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>,
    skipAuth?: boolean
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body,
      headers,
      skipAuth,
    });
  }

  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>,
    skipAuth?: boolean
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", headers, skipAuth });
  }
}

// 创建实例
export const apiClient = new APIClient(WOWNOW_API_URL);
