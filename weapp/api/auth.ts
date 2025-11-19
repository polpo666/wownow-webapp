import { AuthResponse, User } from "@/types";
import { apiClient, type APIResponse } from "../utils/api-client";

export function login(code: string, phoneCode: string): Promise<APIResponse<AuthResponse>> {
  return apiClient.post<AuthResponse>(`/v1/auth/wechat`, { code, phoneCode });
}

export function getUserInfo(): Promise<APIResponse<User>> {
  return apiClient.get<User>('/v1/user/info', {
    usePre: { enable: false }
  });
}

export function updateUserDetail(user: Partial<User>): Promise<APIResponse<{ success: boolean }>> {
  return apiClient.post<{ success: boolean }>('/v1/user/update', user);
}

export function refreshToken(): Promise<APIResponse<{ token: string; expires_in: number }>> {
  return apiClient.post(`/v1/auth/refresh`);
}
