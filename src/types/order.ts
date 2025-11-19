import type { Asset } from './asset'

export interface DiscountRecordItem {
  desc?: string
  name?: number | string
}

export interface Device {
  id: number
  deviceCode: string
  deviceName: string
  location: string
  address: string
  adcode?: string
  apiKey?: string
  apiUrl?: string
  cncDeviceStatus?: string
  createdAt?: string
  createdBy?: number
  lastStatusCheck?: string
  remark?: string
  sort?: number
  status?: number
  updatedAt?: string
  updatedBy?: number
  uvDeviceStatus?: string
  contact?: string
  contactName?: string
  contactAddress?: string
  distance?: number | string
}

export interface Order {
  id: number
  memberId?: number
  orderSn: string
  productName: string
  productDesc?: string
  amount: number
  payAmount: number
  status: OrderStatus
  payAt: string
  completeAt?: string
  remark?: string
  createdAt?: string
  updatedAt?: string
  quantity: number
  pickupCode?: string
  asset: Asset
  device: Device
  discountRecord?: DiscountRecordItem[]
}

export interface PayStatus {
  payStatus: number
  orderStatus: number
  payAt: string
}

export enum OrderStatus {
  PENDING = 1, // 待支付
  PAID = 2, // 排单中
  PROCESSING = 3, // 生产中
  READY_FOR_PICKUP = 4, // 待取货
  COMPLETED = 5, // 订单完成
  CLOSED = 6, // 订单关闭
  ERROR = 7, // 订单异常
  DETAIN = 8, // 订单滞留
}

export interface OrderCreateReq {
  amount: number
  assetId: number
  deviceId: number | null
  productDesc?: string
  productName: string
  quantity: number
  taskType: string
  userCouponId: number[]
}

export interface OrderCreateResponse {
  orderId?: number
  orderSn: string
  payData: string
  payAmount: number
}

export interface OrderPayReq {
  orderSn: string
  payType: string
  tradeType: string
}

export interface OrderPayRes {
  orderSn: string
  payData: string
  payAmount: number
  tradeType: string
}

export interface OrderRefundReq {
  amount: number
  orderSn: string
  reason: string
  refundSn?: string
}

export interface OrderRefundRes {
  refundSn?: string
  status?: string
}

export interface OrderDeleteRes {
  isSuccess: boolean
  msg: string
}
