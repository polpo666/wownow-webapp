import type { PageReq } from './base';
import { OrientationType } from './asset';

export enum TemplateLabel {
  FlatCoin = '平雕-圆形纪念币',
  ReliefCoin = '浮雕-圆形纪念币',
  UVCoin = 'UV-圆形纪念币',
  FlatCard = '平雕-纪念卡',
  ReliefCard = '浮雕-纪念卡',
  NormalCard = '普通卡片',
  RedEnvelopeCard = '红包卡片',
  FlatSquareCard = '平雕-正方形金属卡片',
  ReliefSquareCard = '浮雕-正方形金属卡片',
  LuxuryFlatSquareCard = '轻奢-平雕-正方形金属卡片',
  LuxuryReliefSquareCard = '轻奢-浮雕-正方形金属卡片',
}

export interface TemplateListReq extends PageReq {
  id?: number;
  name?: string;
  styleId?: number; // 风格ID
  type?: 'normal' | 'craft'; // 模板类型 (normal/craft)
  craftType?: string; // 工艺类型(平雕/浮雕/UV打印)
  label?: string; // 标签(纪念币/冰箱贴/卡片)
  isRecommended?: number; // 是否推荐：0-否 1-是
  status?: number; // 状态：0-禁用 1-正常
  priceMin?: number; // 最低价格
  priceMax?: number; // 最高价格
  position?: 'chat_box' | 'home_page';
}

export interface ProcessOption {
  default: boolean; // 是否默认选项
  duration: string; // 处理时间
  price: number; // 价格
  processType: '快速加工' | '精制加工';
  taskType: string; // 任务类型
  discount?: number; // 折扣百分比
  discountedPrice?: number; // 折后价
}

export interface WownowTemplate {
  id: number;
  name: string; // 模板名称
  description: string; // 模板描述
  styleId: number; // 使用风格ID
  shapeSize: string; // 形状/尺寸
  materialDescription: string; // 材质说明
  threeDimensionUrls: string[]; // 3D展示URL数组
  sceneDescription: string; // 适用场景
  coverUrl: string; // 封面预览图URL
  recommendCoverUrl: string; // 推荐封面URL
  prompt: string; // 提示词
  processOptions: ProcessOption[]; // 处理选项数组
  type: 'normal' | 'craft'; // 模板类型 (normal/craft)
  craftType: string; // 工艺类型 (例如: 平雕/浮雕/UV打印)
  taskType: string; // 任务类型
  label: TemplateLabel; // 标签(纪念币/冰箱贴/卡片)
  isRecommended: boolean; // 是否推荐模板
  isDeleted: boolean; // 是否删除：0-否 1-是
  status: number; // 状态
  sort: number; // 排序
  createdAt: Date;
  updatedAt: Date;
  categoryName: string; // 品类名称
  styleName: string; // 风格名称
  orientation: OrientationType;
  aspectRatio: string;
  position: 'chat_box' | 'home_page';
}

export interface PromptStyleLstReq extends PageReq {
  id?: number;
  name?: string;
  nameEn?: string;
  status?: number; // 状态：0-禁用 1-正常
}

export interface WownowPromptStyle {
  id: number;
  name: string;
  nameEn: string;
  description: string;
  prompt: string; // AI提示词
  imageUrl: string; // 效果图URL
  thumbnail: string; // 缩略图URL
  status: number; // 状态：0-禁用 1-正常
  isDeleted: number; // 是否删除：0-否 1-是
  createdAt: Date;
  updatedAt: Date;
}
