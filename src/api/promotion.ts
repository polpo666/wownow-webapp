import { apiClient, type APIResponse } from '@/utils/api-client'
import type { WownowBanner } from '@/types/promotion'
import type { PageRes } from '@/api/asset'

// 获取 Banner 列表
export function getBannerList(placement: string): Promise<APIResponse<PageRes<WownowBanner[]>>> {
  return apiClient.get<PageRes<WownowBanner[]>>('/v1/banner/list', {
    params: { placement },
    skipAuth: true,
  })
}
