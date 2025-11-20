import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ProcessOption, WownowTemplate } from '@/types/template'

export interface NFCAgent {
  id: string
  name: string
  description: string
  icon: string
  coverUrl: string
  url: string
  metadata: string | null
  coverUrlError?: boolean
}

export interface NFCContent {
  id?: string
  type: 'link' | 'custom' | 'agent'
  link: string
  text: string
  attachments: Array<{
    name: string
    url: string
    contentType: string
  }>
  assetId?: number
  agent?: NFCAgent
}

export const useProduceStore = defineStore('produce', () => {
  const deviceId = ref<number | null>(null)
  const assetId = ref<number | null>(null)
  const chatTemplate = ref<WownowTemplate | null>(null)
  const productImageUrl = ref<string>('')
  const productType = ref<string>('平面固时纪念币')
  const price = ref<number>(0.01)
  const discountedPrice = ref<number | undefined>(undefined)
  const processType = ref<'快速加工' | '精制加工'>('快速加工')
  const processDuration = ref<string>('20min')
  const processOption = ref<ProcessOption | null>(null)
  const quantity = ref<number>(1)
  const nfcContent = ref<NFCContent | null>(null)

  const totalPrice = computed(() => {
    const currentPrice = discountedPrice.value || price.value || 0.01
    return parseFloat((currentPrice * quantity.value).toFixed(2))
  })

  const hasNFC = computed(() => !!nfcContent.value)
  const isDeviceSelected = computed(() => deviceId.value !== null)
  const isAssetSelected = computed(() => assetId.value !== null)

  function setDeviceId(id: number | null) {
    deviceId.value = id
  }

  function setAssetId(id: number | null) {
    assetId.value = id
  }

  function setChatTemplate(template: WownowTemplate | null) {
    chatTemplate.value = template
  }

  function setProductImageUrl(url: string) {
    productImageUrl.value = url
  }

  function setProductType(type: string) {
    productType.value = type
  }

  function setPrice(p: number) {
    price.value = p
  }

  function setDiscountedPrice(p?: number) {
    discountedPrice.value = p
  }

  function setProcessType(type: '快速加工' | '精制加工') {
    processType.value = type
  }

  function setProcessDuration(duration: string) {
    processDuration.value = duration
  }

  function setProcessOption(option: ProcessOption | null) {
    processOption.value = option
  }

  function setQuantity(qty: number) {
    quantity.value = Math.max(1, qty)
  }

  function setNfcContent(content: Partial<NFCContent>) {
    if (nfcContent.value) {
      nfcContent.value = { ...nfcContent.value, ...content }
    } else {
      nfcContent.value = content as NFCContent
    }
  }

  function clearNfc() {
    nfcContent.value = null
  }

  function clearAssetId() {
    assetId.value = null
  }

  function resetOrder() {
    nfcContent.value = null
    quantity.value = 1
  }

  function resetAll() {
    deviceId.value = null
    assetId.value = null
    chatTemplate.value = null
    productImageUrl.value = ''
    productType.value = '平面固时纪念币'
    price.value = 0.01
    discountedPrice.value = undefined
    processType.value = '快速加工'
    processDuration.value = '20min'
    processOption.value = null
    quantity.value = 1
    nfcContent.value = null
  }

  return {
    // state
    deviceId,
    assetId,
    chatTemplate,
    productImageUrl,
    productType,
    price,
    discountedPrice,
    processType,
    processDuration,
    processOption,
    quantity,
    nfcContent,
    // getters
    totalPrice,
    hasNFC,
    isDeviceSelected,
    isAssetSelected,
    // actions
    setDeviceId,
    setAssetId,
    setChatTemplate,
    setProductImageUrl,
    setProductType,
    setPrice,
    setDiscountedPrice,
    setProcessType,
    setProcessDuration,
    setProcessOption,
    setQuantity,
    setNfcContent,
    clearNfc,
    clearAssetId,
    resetOrder,
    resetAll,
  }
})
