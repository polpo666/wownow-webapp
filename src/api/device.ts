import { apiClient, type APIResponse } from '@/utils/api-client'
import type { Device } from '@/types/order'
import type { PageReq, PageRes } from '@/api/asset'

export interface DeviceListReq extends PageReq {
  id?: number
  deviceCode?: string
  deviceName?: string
  location?: string
  adcode?: string
  status?: number
  userLng?: number
  userLat?: number
  withDistance?: boolean
}

export function getDeviceList(params?: DeviceListReq): Promise<APIResponse<PageRes<Device[]>>> {
  return apiClient.get<PageRes<Device[]>>('/v1/device/list', {
    params: { ...params },
  })
}
