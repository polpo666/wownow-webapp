import { Attachment } from "./base";

export type NfcContentType = 'link' | 'custom' | 'agent';

export type NFCContent = {
  id?: string;
  type: NfcContentType;
  link: string;
  text: string;
  attachments: Attachment[];
  assetId?: number; // 关联的资产ID
  agent?: NfcAgent;
};

export type NfcUploadFile = {
  name: string;
  type: "image" | "video" | "audio";
  contentType: string; // 文件的MIME类型
  size: number; 
  tempFilePath: string;  //本地临时文件路径 (本地路径)
  thumbTempFilePath?: string;  //视频缩略图临时文件路径
}

export type NfcAgentListRes = {
  list: NfcAgent[];
}

export type NfcAgent = {
  id: string;
  name: string;
  description: string;
  icon: string;
  coverUrl: string;
  url: string;
  metadata: string | null; // JSON字符串，包含额外的元数据
  coverUrlError?: boolean;
}

export type Channel = {
  id: string;
  name: string;
  alias: string;
  createdAt: string;
  updatedAt: string;
}