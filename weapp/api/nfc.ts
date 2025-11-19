import { NfcAgent, NfcAgentListRes, NFCContent } from "@/types";
import { apiClient, APIResponse } from "@/utils/api-client";

// createNfc 接口没有v1前缀
export function createNfc(nfc: NFCContent): Promise<APIResponse<NFCContent>> {
  return apiClient.post<NFCContent>('/nfc/content', nfc);
}

export function updateNfc(nfc: Partial<NFCContent>): Promise<APIResponse<NFCContent>> {
  return apiClient.put<NFCContent>('/nfc/content', nfc);
}

export function getNfcAgentList(): Promise<APIResponse<{ list: NfcAgent[] }>> {
  return apiClient.get<{ list: NfcAgent[] }>('/v1/nfc-agent/list', {
    usePre: {
      cacheKey: '/v1/nfc-agent/list',
      enable: true,
      cacheInvalidationTime: 60000,
      equals(selfConfig, cacheConfig) {
        return JSON.stringify(selfConfig.params) === JSON.stringify(cacheConfig.params);
      },
    }
  });
}
