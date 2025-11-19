import type { DeviceListReq, PageRes } from "../types";
import type { Device } from "../types";
import { apiClient, type APIResponse } from "../utils/api-client";

export function getDeviceList(
  params?: DeviceListReq
): Promise<APIResponse<PageRes<Device[]>>> {
  return apiClient.get<PageRes<Device[]>>(`/v1/device/list`, {
    params: { ...params },
    usePre: {
      cacheKey: `/v1/device/list`,
      enable: false,
      cacheInvalidationTime: 60000,
      equals(selfConfig, cacheConfig) {
        return (
          JSON.stringify(selfConfig.params) ===
          JSON.stringify(cacheConfig.params)
        );
      },
    },
  });
}
