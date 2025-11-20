import { apiClient, type APIResponse } from '@/utils/api-client'
import type { NFCAgent } from '@/stores/produce'

export interface NFCContent {
  id?: string
  type: 'link' | 'custom' | 'agent'
  link: string
  text: string
  attachments: Array<{
    name: string
    url: string
    contentType: string
  }>
  assetId?: number
  agent?: NFCAgent
}

export interface NfcAgentListRes {
  list: NFCAgent[]
}

// 创建 NFC 内容
export function createNfc(nfc: NFCContent): Promise<APIResponse<NFCContent>> {
  return apiClient.post<NFCContent>('/nfc/content', nfc)
}

// 更新 NFC 内容
export function updateNfc(nfc: Partial<NFCContent>): Promise<APIResponse<NFCContent>> {
  return apiClient.put<NFCContent>('/nfc/content', nfc)
}

// 获取 NFC 智能体列表
export function getNfcAgentList(): Promise<APIResponse<NfcAgentListRes>> {
  return apiClient.get<NfcAgentListRes>('/v1/nfc-agent/list')
}
