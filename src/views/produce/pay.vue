<template>
  <div class="pay-page">
    <nav-bar title="下单生产" :is-back="true" />

    <div class="content-wrapper">
      <!-- 产品信息 -->
      <div class="product-info-section">
        <div class="product-info">
          <!-- 产品图片 -->
          <div class="product-image-wrapper">
            <img
              v-if="productImageUrl"
              :src="productImageUrl"
              alt="product"
              class="product-image"
            />
          </div>

          <!-- 产品详情 -->
          <div class="product-details">
            <div class="product-name">{{ productName }}</div>

            <div class="product-tags">
              <span v-if="category" class="tag">{{ category }}</span>
              <span class="tag">{{ craftType }}</span>
            </div>

            <div class="product-tags">
              <span v-if="hasNFC" class="tag">NFC</span>
              <span class="tag">{{ processOption?.processType }}</span>
              <span class="tag">×{{ quantity }}</span>
            </div>
          </div>

          <!-- 价格 -->
          <div class="product-price">
            <div class="price-row">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ totalPrice }}</span>
            </div>
            <div v-if="discountedPrice" class="original-price-row">
              <span class="original-price">¥{{ price }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 加工时间 -->
      <div class="process-time-section">
        <div class="section-title">
          <span>加工时间</span>
        </div>
        <div class="process-time-card">
          <div class="process-type">{{ processOption?.processType }}</div>
          <div class="process-duration">预计时间：{{ processOption?.duration }}</div>
        </div>
      </div>

      <!-- NFC配置 -->
      <div v-if="nfcContent" class="nfc-section">
        <nfc-component :edit="false" />
      </div>

      <!-- 优惠券 -->
      <div class="coupon-section">
        <div class="section-title-coupon">
          <span>优惠券</span>
          <img src="@/assets/svgs/icon-ticket.svg" class="ticket-icon" alt="ticket" />
        </div>
        <div class="coupon-card" @click="onClickCoupon">
          <span class="coupon-label">共优惠</span>
          <span class="coupon-price">-¥{{ couponPrice }}</span>
          <van-icon name="arrow" size="14" color="#d4d4d4" />
        </div>
      </div>
    </div>

    <!-- 支付按钮 -->
    <div class="bottom-actions">
      <van-button block type="primary" color="#FADA39" class="pay-button" @click="onPayButtonClick">
        <span class="pay-button-text">确认支付 ¥{{ finalPrice }}</span>
      </van-button>
    </div>

    <!-- 优惠券选择器 -->
    <van-popup
      v-model:show="showCouponSelector"
      round
      position="bottom"
      :style="{ height: '80%', background: '#232323' }"
      @close="onCloseCouponSelector"
    >
      <coupon-selector
        :total-price="totalPrice"
        :template-id="chatTemplate?.id"
        @confirm="onCouponConfirm"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProduceStore } from '@/stores/produce'
import { createOrder } from '@/api/order'
import { updateAsset } from '@/api/asset'
import { createNfc, updateNfc } from '@/api/nfc'
import type { Asset } from '@/types/asset'
import { OrientationType } from '@/types/asset'
import { WOWNOW_NFC_URL } from '@/lib/constants'
import { showFailToast, showLoadingToast, closeToast, showSuccessToast } from 'vant'
import NfcComponent from '@/components/nfc.vue'
import CouponSelector from '@/components/coupon-selector/index.vue'
import NavBar from '@/components/nav-bar.vue'
import type { UserCoupon } from '@/types/promotion'

const router = useRouter()
const produceStore = useProduceStore()

const chatTemplate = computed(() => produceStore.chatTemplate)
const productImageUrl = computed(() => produceStore.productImageUrl)
const price = computed(() => produceStore.price)
const discountedPrice = computed(() => produceStore.discountedPrice)
const processOption = computed(() => produceStore.processOption)
const quantity = computed(() => produceStore.quantity)
const totalPrice = computed(() => produceStore.totalPrice)
const hasNFC = computed(() => produceStore.hasNFC)
const nfcContent = computed(() => produceStore.nfcContent)

const productName = computed(() => chatTemplate.value?.name || '产品名称')
const craftType = computed(() => chatTemplate.value?.craftType || '工艺类型')
const category = computed(() => {
  if (!chatTemplate.value) return ''
  const labelSegments = chatTemplate.value.label.split('-')
  return labelSegments[1] || labelSegments[0] || ''
})

const showCouponSelector = ref(false)
const couponPrice = ref(0)
const selectedCouponIds = ref<number[]>([])

const finalPrice = computed(() => {
  return parseFloat(Math.max(totalPrice.value - couponPrice.value, 0).toFixed(2))
})

// 点击优惠券
const onClickCoupon = () => {
  showCouponSelector.value = true
}

// 关闭优惠券选择器
const onCloseCouponSelector = () => {
  showCouponSelector.value = false
}

// 确认选择优惠券
const onCouponConfirm = (coupons: UserCoupon[]) => {
  let totalDiscount = 0

  coupons.forEach((coupon) => {
    if (coupon.type === 'discount') {
      const discountRate = coupon.discountRate || 100
      totalDiscount += (totalPrice.value || 0) * (1 - discountRate / 100)
    } else if (coupon.type === 'cash') {
      totalDiscount += coupon.discountAmount || 0
    } else if (coupon.type === 'free') {
      totalDiscount += totalPrice.value - 0.01
    }
  })

  couponPrice.value = parseFloat(totalDiscount.toFixed(2))
  selectedCouponIds.value = coupons.map((c) => c.id)
  onCloseCouponSelector()
}

// 生成 UUID (简化版)
const generateUuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 支付按钮点击
const onPayButtonClick = async () => {
  if (!processOption.value) {
    showFailToast('没有加工选项')
    return
  }

  if (!produceStore.deviceId) {
    showFailToast('请选择设备')
    return
  }

  try {
    showLoadingToast({
      message: '创建订单中...',
      forbidClick: true,
    })

    const nfcId = generateUuid()
    let finalAssetId = produceStore.assetId
    let linkVal = ''

    // NFC未保存时先创建
    if (nfcContent.value) {
      const { type, text, attachments, link } = nfcContent.value

      linkVal = type === 'custom' ? `${WOWNOW_NFC_URL}/${nfcId}` : link

      const newNfc = {
        id: nfcId,
        type,
        link: linkVal,
        text:
          text || (type === 'custom' ? `WOWNOW (${new Date().toISOString().split('T')[0]})` : ''),
        attachments,
        assetId: produceStore.assetId || undefined,
      }

      const result = await createNfc(newNfc)
      if (result.code !== 0 || !result.data) {
        throw new Error(result.message || 'NFC创建失败')
      }
    }

    // 创建或更新资产
    const asset: Asset = {
      ...(produceStore.assetId ? { id: produceStore.assetId } : {}),
      name: productName.value,
      generatedImageUrl: productImageUrl.value,
      templateId: chatTemplate.value?.id,
      nfcContent: nfcContent.value && linkVal ? { type: 'uri', value: linkVal } : null,
      processingConfig: {
        processType: processOption.value.processType,
      },
      orientation: chatTemplate.value?.orientation || OrientationType.LANDSCAPE,
    }

    const res = await updateAsset(asset)
    finalAssetId = res.data?.id || produceStore.assetId
    if (!finalAssetId) {
      showFailToast('资产保存失败')
      return
    }

    // NFC已保存但未关联资产时更新NFC
    if (nfcContent.value && !produceStore.assetId) {
      await updateNfc({ id: nfcId, assetId: finalAssetId })
    }

    // 创建订单
    const orderData = {
      deviceId: produceStore.deviceId!,
      assetId: finalAssetId!,
      productName: productName.value,
      productDesc: '订单描述',
      amount: finalPrice.value,
      quantity: quantity.value,
      taskType: processOption.value.taskType || '',
      userCouponId: selectedCouponIds.value,
    }

    const response = await createOrder(orderData)

    if (response.code === 0 && response.data) {
      closeToast()
      showSuccessToast('订单创建成功')
      // TODO: 实现支付逻辑
      // 跳转到订单列表
      setTimeout(() => {
        router.push('/order')
      }, 1500)
    } else {
      closeToast()
      showFailToast(response.message || '创建订单失败')
    }
  } catch (error) {
    closeToast()
    console.error('创建订单失败:', error)
    const errorMessage = error instanceof Error ? error.message : '创建订单失败'
    showFailToast(errorMessage)
  }
}
</script>

<style scoped>
.pay-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
  color: #fff;
  padding-bottom: env(safe-area-inset-bottom);
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
}

/* 产品信息 */
.product-info-section {
  padding: 16px 15px;
}

.product-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.product-image-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 4px;
}

.product-tags {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #989898;
  margin: 6px 0;
}

.tag {
  padding: 2px 4px;
  background: #191919;
  border-radius: 6px;
}

.product-price {
  text-align: right;
  flex-shrink: 0;
}

.price-row {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  padding-right: 4px;
}

.price-value {
  font-size: 35px;
  font-weight: bold;
  color: #fff;
}

.original-price-row {
  margin-top: 4px;
}

.original-price {
  font-size: 14px;
  color: #989898;
  text-decoration: line-through;
}

/* 加工时间 */
.process-time-section {
  padding: 0 15px;
  width: 50%;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 11px;
  font-size: 16px;
  color: #cccccc;
}

.process-time-card {
  border: 1px solid #fff;
  border-radius: 12px;
  padding: 9px;
}

.process-type {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
}

.process-duration {
  font-size: 13px;
  color: #fff;
  margin-top: 6px;
}

/* NFC配置 */
.nfc-section {
  padding: 0 3px;
  margin-bottom: 4px;
}

/* 优惠券 */
.coupon-section {
  padding: 15px;
  padding-bottom: 16px;
}

.section-title-coupon {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 16px;
  color: #cccccc;
}

.ticket-icon {
  width: 16px;
  height: 16px;
}

.coupon-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px 12px 15px;
  background: #232323;
  border-radius: 12px;
  margin-top: 8px;
  cursor: pointer;
  gap: 6px;
}

.coupon-card:active {
  opacity: 0.7;
}

.coupon-label {
  font-size: 14px;
  color: #fff;
}

.coupon-price {
  font-size: 16px;
  color: #d4d4d4;
  margin-left: auto;
  margin-right: 6px;
}

/* 底部按钮 */
.bottom-actions {
  width: 100%;
  padding: 12px 15px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.pay-button {
  width: 100%;
  border-radius: 16px;
  height: 44px;
}

.pay-button-text {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}
</style>
