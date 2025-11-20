import { apiClient, type APIResponse } from '@/utils/api-client'
import type {
  TemplateListReq,
  PromptStyleLstReq,
  WownowTemplate,
  WownowPromptStyle,
} from '@/types/template'
import type { PageRes } from './asset'

// 获取模板列表
export function getTemplates(
  params?: TemplateListReq,
): Promise<APIResponse<PageRes<WownowTemplate[]>>> {
  return apiClient.get<PageRes<WownowTemplate[]>>('/v1/template/list', {
    params: { ...params },
    skipAuth: true,
  })
}

// 获取模板详情
export function getTemplateDetail(id: number): Promise<APIResponse<WownowTemplate>> {
  return apiClient.get<WownowTemplate>(`/v1/template/view`, {
    params: { id },
    skipAuth: true,
  })
}

// 获取风格列表
export function getPromptStyles(
  params?: PromptStyleLstReq,
): Promise<APIResponse<PageRes<WownowPromptStyle[]>>> {
  return apiClient.get<PageRes<WownowPromptStyle[]>>('/v1/promptStyle/list', {
    params: { ...params },
    skipAuth: true,
  })
}
