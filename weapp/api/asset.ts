import type { Asset } from '@/types/asset'
import type { PageReq, PageRes } from '@/types'
import { apiClient, type APIResponse } from '../utils/api-client'

export function getAssetList(
  params: Partial<PageReq> = {},
): Promise<APIResponse<PageRes<Asset[]>>> {
  return apiClient.get<PageRes<Asset[]>>('/v1/userAsset/list', {
    params: { ...params },
    usePre: {
      enable: false,
    },
  })
}

export function getAssetDetail(id: number): Promise<APIResponse<Asset>> {
  return apiClient.get<Asset>(`/v1/userAsset/view`, {
    params: { id },
    usePre: {
      cacheKey: `/v1/userAsset/view?id=${id}`,
      enable: true,
      cacheInvalidationTime: 60000,
      equals(selfConfig, cacheConfig) {
        return selfConfig.params.id === cacheConfig.params.id
      },
    },
  })
}

export function updateAsset(asset: Asset): Promise<APIResponse<{ id: number }>> {
  return apiClient.post<{ id: number }>('/v1/userAsset/edit', asset)
}

export function deleteAsset(id: number): Promise<APIResponse<{ id: number }>> {
  return apiClient.post<{ id: number }>('/v1/userAsset/delete', { id })
}
