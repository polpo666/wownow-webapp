import { PageRes, CouponListResp, WownowBanner, CampaignDetail, ReceiveCouponReq, ReceiveCouponResp, CouponListReq } from "@/types";
import { apiClient, APIResponse } from "@/utils/api-client";

export function getBannerList(placement: string): Promise<APIResponse<PageRes<WownowBanner[]>>> {
  return apiClient.get(`/v1/banner/list`, {
    params: { placement },
    skipAuth: true,
    usePre: {
      cacheKey: `/v1/banner/list`,
      enable: true,
      cacheInvalidationTime: 60000,
      equals(selfConfig, cacheConfig) {
        return (
          JSON.stringify(selfConfig.params) === JSON.stringify(cacheConfig.params)
        );
      },
    },
  });
}

// 获取活动详情
export function getCampaignDetail(campaignId: number): Promise<APIResponse<CampaignDetail>> {
  return apiClient.get(`/v1/campaign/info`, {
    params: { campaignId },
    usePre: { enable: false },
  });
}

// 获取用户优惠券列表
export function getCouponList(params: CouponListReq): Promise<APIResponse<CouponListResp>> {
  return apiClient.get(`/v1/user/coupon`, {
    params,
    usePre: { enable: false },
  });
}

// 领取优惠券
export function receiveCoupon(body: ReceiveCouponReq): Promise<APIResponse<ReceiveCouponResp>> {
  return apiClient.post(`/v1/campaign/getCoupon`, body);
}

// 通过兑换码领取优惠券
export function receiveCouponByCode(code: string): Promise<APIResponse<ReceiveCouponResp>> {
  return apiClient.post(`/v1/campaign/getCouponByCode`, { code });
}
