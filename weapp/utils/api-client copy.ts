// import { signOut } from 'next-auth/react';

import { useAuthStore } from "@/stores/auth-store";
import { WOWNOW_API_URL } from "./constants";

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
}

class APIClient {
  private baseURL: string;

  constructor(baseURL = "") {
    this.baseURL = baseURL;
  }

  // 从 auth-store 获取 token
  private async getToken(): Promise<string | null> {
    try {
      // 使用 getState() 在非 React 组件中获取 store 状态
      const token = useAuthStore.getState().token;
      return token;
    } catch (error) {
      console.error('获取 token 失败:', error);
      return null;
    }
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
    const { method = "GET", headers = {}, body, params } = options;

    // 如果有查询参数，添加到 endpoint
    let fullEndpoint = endpoint;
    if (params && Object.keys(params).length > 0) {
      fullEndpoint += this.buildQueryString(params);
    }

    // 从缓存获取 token
    const token = await this.getToken();

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },  
    };

    if (body) {
      config.body = JSON.stringify(body);
    }
    const url = `${this.baseURL}${fullEndpoint}`;
    // console.log("==================url: ", `${this.baseURL}${fullEndpoint}`);
    const response = await fetch(url, config);
    // console.log("response: ", response);
    const data: APIResponse<T> = await response.json();

    // Check for 401 unauthorized response
    if (response.status === 401 || data.code === 401) {
      // Clear session and redirect to home
      //   await signOut({ callbackUrl: '/' });
      // Throw error to stop further execution
      throw new Error("Unauthorized: Session expired");
    }

    if (!response.ok) {
      throw new Error(data.message || `API request failed: ${response.status}`);
    }

    return data;
  }

  async get<T>(
    endpoint: string,
    options?: { headers?: Record<string, string>; params?: Record<string, any> }
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", ...options });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body, headers });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body, headers });
  }

  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }
}

// 创建实例
export const apiClient = new APIClient(WOWNOW_API_URL);
