import { e } from 'unocss/index';
import type { Asset } from './asset';
import type { Device } from './device';

export interface DiscountRecordItem {
  desc?: string;
  name?: number | string;
}

export interface Order {
  id: number;
  memberId?: number;
  orderSn: string;
  productName: string;
  productDesc?: string;
  amount: number;
  payAmount: number;
  status: OrderStatus; // 订单状态:1=待支付,2=已支付,3=已完成,4=已取消,5=已退款
  payAt: string;
  completeAt?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
  quantity: number; // 订单数量
  pickupCode?: string; // 取件码
  asset: Asset; // 关联的资产信息
  device: Device; // 关联的设备信息
  discountRecord?: DiscountRecordItem[];
}

export interface PayStatus {
  payStatus: number; // 支付状态:1=待支付,2=已支付
  orderStatus: number; // 订单状态:1=待支付,2=已支付,3=已完成,4=已取消,5=已退款
  payAt: string;
}

export enum OrderStatus {
  PENDING = 1,                 // 待支付
  PAID = 2,                    // 排单中
  PROCESSING = 3,              // 生产中
  READY_FOR_PICKUP = 4,        // 待取货
  COMPLETED = 5,               // 订单完成
  CLOSED = 6,                  // 订单关闭
  ERROR = 7,                  // 订单异常
  DETAIN = 8,                  // 订单滞留
}

export interface OrderCreateReq {
  /**
   * 订单金额
   */
  amount: number;
  /**
   * 用户资产ID
   */
  assetId: number;
  /**
   * 设备ID
   */
  deviceId: number | null;
  /**
   * 产品描述
   */
  productDesc?: string;
  /**
   * 产品名称
   */
  productName: string;
  /**
   * 订单数量
   */
  quantity: number;
  taskType: string;
  /**
   * 用户优惠券ID
   */
  userCouponId: number[];
}

/**
 * 支付方式:wxpay=微信支付,alipay=支付宝
 */
export enum PayType {
  Alipay = 'alipay',
  Wxpay = 'wxpay',
}

/**
 * 交易类型:mini/mp=jsapi支付,h5=H5支付,scan=扫码支付
 */
export enum TradeType {
  H5 = 'h5',
  Mini = 'mini',
  Mp = 'mp',
  Scan = 'scan',
}

// Order creation response interface
export interface OrderCreateResponse {
  orderId?: number;
  orderSn: string;
  payData: string;
  payAmount: number;
}

export enum OrderPreviewType {
  Preview = 'preview',
  Tracking = 'tracking',
}

// 订单跟踪步骤
export interface OrderTrackingStep {
  id: number;
  type: OrderPreviewType;
  createTime: string;
  remark: string;
  duration?: number | string;
}

// 订单跟踪响应
export interface OrderTrackingRes {
  order: Order;
  tracking: OrderTrackingStep[];
  preview: OrderTrackingStep[];
}

export interface OrderPayReq {
  orderSn: string;
  payType: string; // 支付方式: wxpay, alipay
  tradeType: string; // 交易类型: mini, mp, h5, scan
}

export interface OrderPayRes {
  orderSn: string;
  payData: string;
  payAmount: number;
  tradeType: string;
}

export interface OrderRefundReq {
  /**
   * 退款金额
   */
  amount: number;
  /**
   * 订单号
   */
  orderSn: string;
  /**
   * 退款原因
   */
  reason: string;
  /**
   * 退款单号
   */
  refundSn?: string;
}

export interface OrderRefundRes {
  /**
   * 退款单号
   */
  refundSn?: string;
  /**
   * 退款状态
   */
  status?: string;
}

export interface OrderDeleteRes {
  isSuccess: boolean;
  msg: string;
}
