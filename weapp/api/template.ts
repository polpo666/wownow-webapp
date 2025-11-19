import {
  PageRes,
  PromptStyleLstReq,
  TemplateListReq,
  WownowPromptStyle,
  WownowTemplate,
} from "@/types";
import { apiClient, APIResponse } from "@/utils/api-client";

export function getTemplates(
  params?: TemplateListReq
): Promise<APIResponse<PageRes<WownowTemplate[]>>> {
  return apiClient.get<PageRes<WownowTemplate[]>>("/v1/template/list", {
    params: { ...params },
    skipAuth: true,
    usePre: {
      cacheKey: `/v1/template/list?styleId=${params?.styleId}`,
      enable: true,
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

export function getCategoryWithTemplates(
  params?: TemplateListReq
): Promise<APIResponse<PageRes<WownowTemplate[]>>> {
  return apiClient.get<PageRes<WownowTemplate[]>>(
    "/v1/template/category-with-templates",
    {
      params: { ...params },
      skipAuth: true,
      usePre: {
        enable: false,
      },
    }
  );
}

export function getTemplateDetail(
  id: number
): Promise<APIResponse<WownowTemplate>> {
  return apiClient.get<WownowTemplate>(`/v1/template/view`, {
    skipAuth: true,
    params: { id },
    usePre: {
      cacheKey: `/v1/template/view?id=${id}`,
      enable: true,
      cacheInvalidationTime: 60000,
      equals(selfConfig, cacheConfig) {
        return selfConfig.params.id === cacheConfig.params.id;
      },
    },
  });
}

export function getPromptStyles(
  params?: PromptStyleLstReq
): Promise<APIResponse<PageRes<WownowPromptStyle[]>>> {
  return apiClient.get<PageRes<WownowPromptStyle[]>>("/v1/promptStyle/list", {
    params: { ...params },
    skipAuth: true,
    usePre: {
      cacheKey: `/v1/promptStyle/list`,
      enable: true,
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

export function getPromptStyleDetail(
  id: number
): Promise<APIResponse<WownowPromptStyle>> {
  console.log("getPromptStyleDetail", id);
  return apiClient.get<WownowPromptStyle>(`/v1/promptStyle/view`, {
    params: { id },
    skipAuth: true,
    usePre: {
      cacheKey: `/v1/promptStyle/view?id=${id}`,
      enable: true,
      cacheInvalidationTime: 60000,
      equals(selfConfig, cacheConfig) {
        return selfConfig.params.id === cacheConfig.params.id;
      },
    },
  });
}
