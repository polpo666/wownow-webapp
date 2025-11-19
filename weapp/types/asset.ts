// export interface Asset {
//   id: number;
//   userId: number;
//   name: string;
//   templateId: number;
//   categoryId: number;
//   styleId: number;
//   generatedImageUrl: string;
//   nfcContent: Record<string, unknown>;
//   processingConfig: Record<string, unknown>;
//   isDeleted: number;
//   createdAt: string;
//   updatedAt: string;
//   userName: string;
//   templateName: string;
//   categoryName: string;
//   styleName: string;
// }

export enum OrientationType {
  LANDSCAPE = 'landscape',
  PORTRAIT = 'portrait',
}

/**
 * hotgo.api.admin.wownow.UserAssetEditReq
 */
/**
 * hotgo.api.api.wownow.v1.UserAssetEditReq
 */
export interface Asset {
    /**
     * 品类ID
     */
    categoryId?: number;
    createdAt?: string;
    /**
     * 生成图片
     */
    generatedImageUrl?: string;
    id?: number;
    /**
     * 是否删除：0-否 1-是
     */
    isDeleted?: number;
    /**
     * 资产名称
     */
    name?: string;
    /**
     * NFC内容
     */
    nfcContent?: { [key: string]: any } | null;
    /**
     * 加工配置
     */
    processingConfig?: { [key: string]: any } | null;
    /**
     * 风格ID
     */
    styleId?: number | null;
    /**
     * 模板ID, 可以为空表示自定义创作
     */
    templateId?: number;
    craftType?: string;
    updatedAt?: string;
    /**
     * 用户ID
     */
    userId?: number;
    orientation: OrientationType;
}
