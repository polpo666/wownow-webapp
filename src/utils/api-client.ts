import { getToken } from '@/utils/storage'
import { useAuthStore } from '@/stores/auth'
import { WOWNOW_API_URL } from '@/lib/constants'
import { showFailToast } from 'vant'

// 通用 API 客户端
export interface APIResponse<T> {
  code: number
  message: string
  data?: T
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  params?: Record<string, string | number | boolean | null | undefined> // 添加 params 支持
  skipAuth?: boolean // 跳过认证
}

class APIClient {
  private baseURL: string

  constructor(baseURL = '') {
    this.baseURL = baseURL
  }

  // 获取 token（从 localStorage 获取）
  private getToken(): string | null {
    return getToken()
  }

  // 辅助方法：构建查询字符串
  private buildQueryString(
    params: Record<string, string | number | boolean | null | undefined>,
  ): string {
    const queryParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString())
      }
    })

    const queryString = queryParams.toString()
    return queryString ? `?${queryString}` : ''
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<APIResponse<T>> {
    const { method = 'GET', headers = {}, body, params, skipAuth = false } = options

    // 如果有查询参数，添加到 endpoint
    let fullEndpoint = endpoint
    if (params && Object.keys(params).length > 0) {
      fullEndpoint += this.buildQueryString(params)
    }

    // 从 store 或 localStorage 获取 token
    const token = skipAuth ? null : this.getToken()

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    }

    if (body) {
      config.body = JSON.stringify(body)
    }

    const url = `${this.baseURL}${fullEndpoint}`
    const response = await fetch(url, config)
    const data: APIResponse<T> = await response.json()

    // 检查 401 未授权响应
    if (response.status === 401 || data.code === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      authStore.setShowLoginModal(true)
      showFailToast('登录已过期，请重新登录')
      throw new Error('Unauthorized: Session expired')
    }

    if (!response.ok) {
      throw new Error(data.message || `API request failed: ${response.status}`)
    }

    return data
  }

  async get<T>(
    endpoint: string,
    options?: {
      headers?: Record<string, string>
      params?: Record<string, string | number | boolean | null | undefined>
      skipAuth?: boolean
    },
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', ...options })
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>,
    skipAuth?: boolean,
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
      headers,
      skipAuth,
    })
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>,
    skipAuth?: boolean,
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
      headers,
      skipAuth,
    })
  }

  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>,
    skipAuth?: boolean,
  ): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
      skipAuth,
    })
  }
}

// 创建实例
export const apiClient = new APIClient(WOWNOW_API_URL)
