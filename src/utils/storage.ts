/**
 * 本地存储工具类
 * 封装 localStorage 操作，提供类型安全的方法
 */

const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  IS_LOGGED_IN: 'isLoggedIn',
} as const

export interface StoredUserInfo {
  id: number
  nickname: string
  avatar: string
  phone?: string
}

/**
 * 存储 Token
 */
export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  } else {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
  }
}

/**
 * 获取 Token
 */
export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

/**
 * 存储用户信息
 */
export function setUserInfo(userInfo: StoredUserInfo | null): void {
  if (userInfo) {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo))
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO)
  }
}

/**
 * 获取用户信息
 */
export function getUserInfo(): StoredUserInfo | null {
  const userInfoStr = localStorage.getItem(STORAGE_KEYS.USER_INFO)
  if (!userInfoStr) {
    return null
  }

  try {
    return JSON.parse(userInfoStr) as StoredUserInfo
  } catch (error) {
    console.error('Failed to parse user info from localStorage:', error)
    return null
  }
}

/**
 * 设置登录状态
 */
export function setLoggedIn(isLoggedIn: boolean): void {
  if (isLoggedIn) {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true')
  } else {
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN)
  }
}

/**
 * 获取登录状态
 */
export function getLoggedIn(): boolean {
  return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true'
}

/**
 * 清除所有认证相关的存储
 */
export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER_INFO)
  localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN)
}

/**
 * 清除所有存储
 */
export function clearAll(): void {
  localStorage.clear()
}
