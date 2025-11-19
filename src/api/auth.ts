import { apiClient, type APIResponse } from '@/utils/api-client'

export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  phone: string
  email: string
  openid: string
  login_source: string
}

// UserInfo 类型（用于 API 返回）
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  phone: string
  email: string
  openid: string
  login_source: string
}

// 短信登录请求
export interface SMSLoginRequest {
  phone: string
  code: string
}

// 微信二维码响应
export interface WeChatQRCodeResponse {
  qrcode_url: string
  scene_str: string
}

// 微信登录状态响应
export interface WeChatLoginStatusResponse {
  state: number // 1: 等待扫码, 2: 已扫码, 3: 已过期
  token?: string
  userInfo?: UserInfo
}

// 发送短信验证码
export function sendSMSCode(
  phone: string,
  type: 'login' | 'register',
): Promise<APIResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>('/v1/auth/sms/send', { phone, type }, undefined, true)
}

// 短信验证码登录
export function smsLogin(
  data: SMSLoginRequest,
): Promise<APIResponse<{ token: string; user: UserInfo }>> {
  return apiClient.post<{ token: string; user: UserInfo }>(
    '/v1/auth/sms/verify',
    data,
    undefined,
    true,
  )
}

// 获取微信登录二维码
export function getWeChatQRCode(userId?: string): Promise<APIResponse<WeChatQRCodeResponse>> {
  const params = userId ? { userId } : {}
  return apiClient.get<WeChatQRCodeResponse>('/v1/auth/wechat/qrcode', {
    params,
    skipAuth: true,
  })
}

// 检查微信登录状态
export function getWeChatLoginStatus(
  sceneStr: string,
): Promise<APIResponse<WeChatLoginStatusResponse>> {
  return apiClient.get<WeChatLoginStatusResponse>('/v1/auth/wechat/status', {
    params: { scene_str: sceneStr },
    skipAuth: true,
  })
}

// 微信登录
export function wechatLogin(
  token: string,
  userInfo: string,
): Promise<APIResponse<{ token: string; user: UserInfo }>> {
  return apiClient.post<{ token: string; user: UserInfo }>(
    '/v1/auth/wechat-login',
    { token, userInfo },
    undefined,
    true,
  )
}

// 获取用户信息
export function getUserInfo(): Promise<APIResponse<UserInfo>> {
  return apiClient.get<UserInfo>('/v1/user/info')
}

// 更新用户信息
export function updateUserDetail(
  data: Partial<UserInfo>,
): Promise<APIResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>('/v1/user/update', data)
}

// 保留旧的登录 API（用于兼容）
export function login(
  code: string,
  phoneCode: string,
): Promise<APIResponse<{ token: string; user: UserInfo; expires_in: number }>> {
  return apiClient.post<{ token: string; user: UserInfo; expires_in: number }>(
    '/v1/auth/wechat',
    { code, phoneCode },
    undefined,
    true,
  )
}

// 刷新 token
export function refreshToken(): Promise<APIResponse<{ token: string; expires_in: number }>> {
  return apiClient.post<{ token: string; expires_in: number }>(
    '/v1/auth/refresh',
    undefined,
    undefined,
    true,
  )
}
