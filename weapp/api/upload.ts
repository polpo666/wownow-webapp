import { OssPresignReq, OssPresignRes } from "@/types";
import { apiClient, APIResponse } from "@/utils/api-client";

// 获取OSS上传凭证
export function ossUploadPresign(body?: OssPresignReq): Promise<APIResponse<OssPresignRes>> {
  return apiClient.post<OssPresignRes>('/v1/upload/oss/presign', body);
}

// 使用预签名URL上传文件到OSS
export function uploadToOSS(tempFilePath: string, uploadUrl: string, contentType: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath: tempFilePath,
      success: (fileRes) => {
        wx.request({
          url: uploadUrl,
          method: "PUT",
          data: fileRes.data,
          header: {
            "Content-Type": contentType,
          },
          success: (uploadRes) => {
            if (uploadRes.statusCode === 200) {
              resolve();
            } else {
              reject(new Error(`上传失败，状态码: ${uploadRes.statusCode}`));
            }
          },
          fail: (error) => {
            reject(new Error(`上传请求失败: ${error.errMsg}`));
          },
        });
      },
      fail: (error) => {
        reject(new Error(`读取文件失败: ${error.errMsg}`));
      },
    });
  });
};
