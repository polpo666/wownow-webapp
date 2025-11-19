import { apiClient, type APIResponse } from '@/utils/api-client'
import type { Asset } from '@/types/asset'

export interface PageReq {
  page?: number
  pageSize?: number
  pagination?: boolean
}

export interface PageRes<T> extends PageReq {
  totalCount: number
  pageCount: number
  list: T
}

// 获取资产列表
export function getAssetList(
  params: Partial<PageReq> = {},
): Promise<APIResponse<PageRes<Asset[]>>> {
  return apiClient.get<PageRes<Asset[]>>('/v1/userAsset/list', {
    params: { ...params },
  })
}

// 获取资产详情
export function getAssetDetail(id: number): Promise<APIResponse<Asset>> {
  return apiClient.get<Asset>('/v1/userAsset/view', {
    params: { id },
  })
}

// 更新资产
export function updateAsset(asset: Asset): Promise<APIResponse<{ id: number }>> {
  return apiClient.post<{ id: number }>('/v1/userAsset/edit', asset)
}

// 删除资产
export function deleteAsset(id: number): Promise<APIResponse<{ id: number }>> {
  return apiClient.post<{ id: number }>('/v1/userAsset/delete', { id })
}
