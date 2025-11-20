import type { OrientationType } from './asset'
import type { PageReq } from '@/api/asset'

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
  id?: number
  name?: string
  styleId?: number
  type?: 'normal' | 'craft'
  craftType?: string
  label?: string
  isRecommended?: number
  status?: number
  priceMin?: number
  priceMax?: number
  position?: 'chat_box' | 'home_page'
}

export interface ProcessOption {
  default: boolean
  duration: string
  price: number
  processType: '快速加工' | '精制加工'
  taskType: string
  discount?: number
  discountedPrice?: number
}

export interface WownowTemplate {
  id: number
  name: string
  description: string
  styleId: number
  shapeSize: string
  materialDescription: string
  threeDimensionUrls: string[]
  sceneDescription: string
  coverUrl: string
  recommendCoverUrl: string
  prompt: string
  processOptions: ProcessOption[]
  type: 'normal' | 'craft'
  craftType: string
  taskType: string
  label: TemplateLabel
  isRecommended: boolean
  isDeleted: boolean
  status: number
  sort: number
  createdAt: Date
  updatedAt: Date
  categoryName: string
  styleName: string
  orientation: OrientationType
  aspectRatio: string
  position: 'chat_box' | 'home_page'
}

export interface PromptStyleLstReq extends PageReq {
  id?: number
  name?: string
  nameEn?: string
  status?: number
}

export interface WownowPromptStyle {
  id: number
  name: string
  nameEn: string
  description: string
  prompt: string
  imageUrl: string
  thumbnail: string
  status: number
  isDeleted: number
  createdAt: Date
  updatedAt: Date
}
