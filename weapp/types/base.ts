import type { TemplateLabel } from "./template";
export interface PageReq {
  page?: number;
  pageSize?: number;
  pagination?: boolean; // 是否需要进行分页
}

export interface PageRes<T> extends PageReq {
  totalCount: number;
  pageCount: number;
  list: T;
}

export interface GenerateImageOptions {
  templateId?: number;
  defaultPrompt?: string; // 品类预置提示词
  stylePrompt?: string; // 风格提示词
  templatePrompt?: string; // 模板提示词
  negativePrompt?: string;
  placeholderUrl?: string;
  width: number;
  height: number;
  productType?: TemplateLabel; // 产品类型
}

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}

export type OssPresignReq = {
  filename: string;
  contentType: string;
  size: number;
}

export type OssPresignRes = {
  uploadUrl: string;
  publicUrl: string;
  ossPath: string;
  filename: string;
  originalFilename: string;
  contentType: string;
  size: number;
}
