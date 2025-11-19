import { apiClient, type APIResponse } from '@/utils/api-client'

export interface Attachment {
  name: string
  url: string
  contentType: string
}

export type OssPresignReq = {
  filename: string
  contentType: string
  size: number
}

export type OssPresignRes = {
  uploadUrl: string
  publicUrl: string
  ossPath: string
  filename: string
  originalFilename: string
  contentType: string
  size: number
}

// 获取OSS上传凭证
export function ossUploadPresign(body?: OssPresignReq): Promise<APIResponse<OssPresignRes>> {
  return apiClient.post<OssPresignRes>('/v1/upload/oss/presign', body)
}

// 使用预签名URL上传文件到OSS（Web 版本）
export async function uploadToOSS(
  file: File,
  uploadUrl: string,
  contentType: string,
): Promise<void> {
  // 读取文件为 ArrayBuffer
  const arrayBuffer = await file.arrayBuffer()

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: arrayBuffer,
    headers: {
      'Content-Type': contentType,
    },
    // 不发送 credentials，避免携带 cookie 等认证信息
    credentials: 'omit',
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`上传失败，状态码: ${response.status}${errorText ? `, ${errorText}` : ''}`)
  }
}
