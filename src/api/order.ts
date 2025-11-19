import { apiClient, type APIResponse } from '@/utils/api-client'
import type {
  Order,
  OrderCreateReq,
  OrderCreateResponse,
  OrderPayReq,
  OrderPayRes,
  PayStatus,
  OrderRefundReq,
  OrderRefundRes,
  OrderDeleteRes,
} from '@/types/order'
import type { PageReq, PageRes } from '@/api/asset'

// 获取订单列表
export function getOrderList(
  params: Partial<PageReq> = {},
): Promise<APIResponse<PageRes<Order[]>>> {
  return apiClient.get<PageRes<Order[]>>('/v1/order/list', {
    params: { ...params },
  })
}

// 获取订单详情
export function getOrderDetail(orderSn: string): Promise<APIResponse<Order>> {
  return apiClient.get<Order>('/v1/order/detail', {
    params: { orderSn },
  })
}

// 创建订单
export function createOrder(order: OrderCreateReq): Promise<APIResponse<OrderCreateResponse>> {
  return apiClient.post<OrderCreateResponse>('/v1/order/create', order)
}

// 支付订单
export function payOrder(order: OrderPayReq): Promise<APIResponse<OrderPayRes>> {
  return apiClient.post<OrderPayRes>('/v1/order/pay', order)
}

// 查询支付状态
export function getPayStatus(orderSn: string): Promise<APIResponse<PayStatus>> {
  return apiClient.get<PayStatus>('/v1/order/payStatus', {
    params: { orderSn },
  })
}

// 取消订单
export function cancelOrder(orderSn: string): Promise<APIResponse<null>> {
  return apiClient.post<null>('/v1/order/cancel', { orderSn })
}

// 订单退款
export function refundOrder(reqData: OrderRefundReq): Promise<APIResponse<OrderRefundRes>> {
  return apiClient.post<OrderRefundRes>('/v1/order/refund', reqData)
}

// 删除订单
export function deleteOrder(orderSn: string): Promise<APIResponse<OrderDeleteRes>> {
  return apiClient.post<OrderDeleteRes>('/v1/order/delete', { orderSn })
}

// 确认取件
export function confirmPickup(orderSn: string): Promise<APIResponse<null>> {
  return apiClient.post<null>('/v1/order/manualPickup', { orderSn })
}
