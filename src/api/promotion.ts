import { apiClient, type APIResponse } from '@/utils/api-client'
import type { WownowBanner, CouponListReq, CouponListResp } from '@/types/promotion'
import type { PageRes } from '@/api/asset'

// 获取 Banner 列表
export function getBannerList(placement: string): Promise<APIResponse<PageRes<WownowBanner[]>>> {
  return apiClient.get<PageRes<WownowBanner[]>>('/v1/banner/list', {
    params: { placement },
    skipAuth: true,
  })
}

// 获取用户优惠券列表
export function getCouponList(params: CouponListReq): Promise<APIResponse<CouponListResp>> {
  return apiClient.get<CouponListResp>('/v1/user/coupon', {
    params,
  })
}
