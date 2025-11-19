import { defineStore } from '@mpxjs/pinia'
import mpx from '@mpxjs/core'
import type { ProcessOption } from '@/types/template'
import { NFCContent } from '@/types'

interface ProduceState {
  deviceId: number | null
  assetId: number | null
  productImageUrl: string
  productType: string
  price: number
  discountedPrice?: number,
  processType: '快速加工' | '精制加工'
  processDuration: string
  processOption: ProcessOption | null
  quantity: number
  nfcContent: NFCContent | null
}

export const useProduceStore = defineStore('produce', {
  state: (): ProduceState => ({
    deviceId: null,
    assetId: null,
    productImageUrl: '',
    productType: '平面固时纪念币',
    price: 0.01,
    discountedPrice: undefined,
    processType: '快速加工',
    processDuration: '20min',
    processOption: null,
    quantity: 1,
    nfcContent: null,
  }),
  getters: {
    getTotalPrice(state) {
      return state.price * state.quantity
    },
    hasNFC(state) {
      return !!state.nfcContent
    },
    isDeviceSelected(state) {
      return state.deviceId !== null
    },
    isAssetSelected(state) {
      return state.assetId !== null
    },
  },
  actions: {
    setDeviceId(deviceId: number | null) {
      this.deviceId = deviceId
    },
    setAssetId(assetId: number | null) {
      this.assetId = assetId
    },
    setProductImageUrl(url: string) {
      this.productImageUrl = url
    },
    setProductType(type: string) {
      this.productType = type
    },
    setPrice(price: number) {
      this.price = price
    },
    setDiscountedPrice(discountedPrice?: number) {
      this.discountedPrice = discountedPrice
    },
    setProcessType(type: '快速加工' | '精制加工') {
      this.processType = type
    },
    setProcessDuration(duration: string) {
      this.processDuration = duration
    },
    setProcessOption(option: ProcessOption | null) {
      this.processOption = option
    },
    setQuantity(quantity: number) {
      this.quantity = Math.max(1, quantity)
    },
    setNfcContent(content: Partial<NFCContent>) {
      if (this.nfcContent) {
        this.nfcContent = { ...this.nfcContent, ...content }
      } else {
        this.nfcContent = content as NFCContent
      }
    },
    clearNfc() {
      this.nfcContent = null
    },
    clearAssetId() {
      this.assetId = null
    },
    resetOrder() {
      this.nfcContent = null
      this.quantity = 1
    },
    resetAll() {
      this.deviceId = null
      this.assetId = null
      this.productImageUrl = ''
      this.productType = '平面固时纪念币'
      this.price = 0.01
      this.processType = '快速加工'
      this.processOption = null
      this.quantity = 1
      this.nfcContent = null
    },
    // 保存到本地存储
    saveToStorage() {
      mpx.setStorageSync('produce-storage', {
        productType: this.productType,
        price: this.price,
        processType: this.processType,
        processDuration: this.processDuration,
        quantity: this.quantity,
        nfcContent: this.nfcContent,
      })
    },
    // 从本地存储恢复
    restoreFromStorage() {
      try {
        const stored = mpx.getStorageSync('produce-storage')
        if (stored) {
          if (stored.productType) this.setProductType(stored.productType)
          if (stored.price) this.setPrice(stored.price)
          if (stored.processType) this.setProcessType(stored.processType)
          if (stored.processDuration) this.setProcessDuration(stored.processDuration)
          if (stored.quantity) this.setQuantity(stored.quantity)
          if (stored.nfcContent) this.setNfcContent(stored.nfcContent)
        }
      } catch (error) {
        console.error('Failed to restore produce store from storage:', error)
      }
    },
  },
})

export type { ProduceState, NFCContent }
