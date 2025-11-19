export interface WownowBanner {
  id: number;
  imageUrl: string; // 图片地址
  placement: string; // 展示位置
  mode: string; // 模式
  campaignId: number; // 关联活动ID
  altText: string; // 图片文案
}

export enum CampaignStatus {
  DRAFT = 'draft',  // 草稿
  SCHEDULED = 'scheduled', // 待开始
  ONLINE = 'online',  // 进行中
  PAUSED = 'paused',  // 已暂停
  ENDED = 'ended',  // 已结束
}

export interface Campaign {
  id: number;
  name: string;
  status: CampaignStatus;  // 活动状态
  startTime: string; // 活动开始时间
  endTime: string;  // 活动结束时间
  description: string;  // 活动描述
  claimedCount: number;  // 已领取优惠券总数
  createdAt: string;
  updatedAt: string;
  content: string;  // 活动内容
  coverImageUrl: string;  // 封面图
}

export type CouponType = 'cash' | 'discount' | 'free';
export type CouponStatus = 'unused' | 'used' | 'expired' | 'frozen';

export enum CouponGetable {
  NOT_GETABLE = 0, // 不可领取
  GETABLE = 1,     // 可领取
}

export type CampaignCoupon = {
  id: number;
  name: string;  // 优惠券名称
  type: CouponType;  // 优惠券类型
  stackable: number;  // 是否可叠加使用，0-不可叠加，1-可叠加
  description: string;
  discountAmount: number;  // 优惠金额
  discountRate: number;  // 折扣率
  thresholdAmount: number;  // 使用门槛
  startTime: string;  // 生效时间
  endTime: string;  // 失效时间
  validityType: 'absolute' | 'relative';  // 有效期类型，absolute-固定时间，relative-相对时间
  validDays: number;  // 有效天数
  userScope: string;  // 用户范围
  sendTimeEnd: string | null;  // 发放结束时间
  sendTimeStart: string | null;  // 发放开始时间
  getable: CouponGetable;  // 是否可领取，0-不可领取，1-可领取
}

export interface UserCouponRule {
  ruleType: "inclusion" | "exclusion";  // 规则类型，inclusion-包含，exclusion-排除
  targetType: string;  // 目标类型，template-模板
  values: number[];  // 目标值列表
}

export interface UserCoupon {
  id: number;
  name: string;
  type: CouponType;  // 优惠券类型
  validStart: string;  // 生效时间
  validEnd: string;  // 失效时间
  status: CouponStatus;  // 使用状态
  description: string;
  discountAmount: number;  // 优惠金额
  discountRate: number;  // 折扣率
  thresholdAmount: number;  // 使用门槛
  stackable: number;  // 是否可叠加使用，0-不可叠加，1-可叠加
  scopeJson: { rules: UserCouponRule[] } | null;  // 使用范围规则
}

export type ExtendedUserCoupon = UserCoupon & {
  unavailableReasons?: string[];
}

export interface CampaignDetail {
  campaign: Campaign;
  Coupons: CampaignCoupon[];
}

export interface CouponListReq {
  page: number;
  pageSize: number;
  status?: CouponStatus;
}

export interface CouponListResp {
  list: UserCoupon[];
  total: number;
}

export interface ReceiveCouponReq {
  campaignId: number;  // 活动ID
  couponTemplateId: number; // 优惠券ID
}

export interface ReceiveCouponResp {
  success: boolean;
  msg: string;
}
