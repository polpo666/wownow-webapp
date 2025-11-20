export interface WownowBanner {
  id: number
  imageUrl: string // 图片地址
  placement: string // 展示位置
  mode: string // 模式
  campaignId: number // 关联活动ID
  altText: string // 图片文案
}

export type CouponType = 'cash' | 'discount' | 'free'
export type CouponStatus = 'unused' | 'used' | 'expired' | 'frozen'

export interface UserCouponRule {
  ruleType: 'inclusion' | 'exclusion' // 规则类型，inclusion-包含，exclusion-排除
  targetType: string // 目标类型，template-模板
  values: number[] // 目标值列表
}

export interface UserCoupon {
  id: number
  name: string
  type: CouponType // 优惠券类型
  validStart: string // 生效时间
  validEnd: string // 失效时间
  status: CouponStatus // 使用状态
  description: string
  discountAmount: number // 优惠金额
  discountRate: number // 折扣率
  thresholdAmount: number // 使用门槛
  stackable: number // 是否可叠加使用，0-不可叠加，1-可叠加
  scopeJson: { rules: UserCouponRule[] } | null // 使用范围规则
}

export type ExtendedUserCoupon = UserCoupon & {
  unavailableReasons?: string[]
}

export interface CouponListReq {
  page: number
  pageSize: number
  status?: CouponStatus
}

export interface CouponListResp {
  list: UserCoupon[]
  total: number
}
