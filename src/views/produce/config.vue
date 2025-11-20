<template>
  <div class="config-page">
    <nav-bar title="下单生产" :is-back="true" />

    <div class="content-wrapper">
      <!-- 产品展示区域 -->
      <div class="product-preview">
        <img
          v-if="productImageUrl"
          :src="productImageUrl"
          alt="product"
          class="product-image"
          @load="onImageLoad"
          @error="onImageError"
        />
      </div>

      <!-- 价格和数量 -->
      <div class="price-quantity-section">
        <div class="price-section">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ totalPrice }}</span>
          <span v-if="discountedPrice" class="original-price">¥{{ price }}</span>
        </div>
        <div class="quantity-section">
          <span class="quantity-label">数量</span>
          <div class="quantity-controls">
            <div class="quantity-btn" @click="decreaseQuantity">
              <van-icon name="minus" size="12px" :color="quantity <= 1 ? '#666' : '#ffffff'" />
            </div>
            <div class="quantity-value">{{ quantity }}</div>
            <div class="quantity-btn" @click="increaseQuantity">
              <van-icon name="plus" size="12px" :color="quantity >= 1 ? '#666' : '#ffffff'" />
            </div>
          </div>
        </div>
      </div>

      <!-- 配置选项 -->
      <div class="config-section">
        <!-- 加工时间 -->
        <div class="process-time-section">
          <div class="section-title">
            <span>加工时间</span>
            <van-icon name="clock-o" size="14px" color="#ccc" />
          </div>

          <div v-if="currentProcessOptions.length > 0" class="process-options">
            <div
              v-for="option in currentProcessOptions"
              :key="option.processType"
              class="process-option"
              :class="{ active: processOption?.processType === option.processType }"
              @click="onProcessOptionClick(option)"
            >
              <div class="option-name">{{ option.processType }}</div>
              <div class="option-duration">预计时间：{{ option.duration }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- NFC功能 -->
      <div class="nfc-section">
        <nfc-component />
      </div>
    </div>

    <!-- 底部下单按钮 -->
    <div class="bottom-actions">
      <van-button block type="primary" color="#FADA39" class="order-button" @click="goPayPage">
        <span class="order-button-text">下单生产</span>
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProduceStore } from '@/stores/produce'
import { getTemplateDetail } from '@/api/template'
import type { ProcessOption } from '@/types/template'
import { showFailToast, showToast } from 'vant'
import NfcComponent from '@/components/nfc.vue'
import NavBar from '@/components/nav-bar.vue'

const router = useRouter()
const route = useRoute()
const produceStore = useProduceStore()

const productImageUrl = computed(() => produceStore.productImageUrl)
const price = computed(() => produceStore.price)
const discountedPrice = computed(() => produceStore.discountedPrice)
const processOption = computed(() => produceStore.processOption)
const quantity = computed(() => produceStore.quantity)
const totalPrice = computed(() => produceStore.totalPrice)

const currentProcessOptions = ref<ProcessOption[]>([])
const imageLoading = ref(true)

// 图片加载完成
const onImageLoad = () => {
  imageLoading.value = false
}

// 图片加载失败
const onImageError = () => {
  imageLoading.value = false
}

// 初始化加工选项
const initProcessOptions = async () => {
  // 如果已经有产品图片，说明是从模板页面来的，需要获取模板信息
  if (productImageUrl.value) {
    // 尝试从路由参数获取模板ID
    const templateId = route.query.templateId
    if (templateId) {
      try {
        const res = await getTemplateDetail(Number(templateId))
        if (res.code === 0 && res.data) {
          const options = res.data.processOptions?.slice(0, 2) || []
          currentProcessOptions.value = options
          // 默认选择第一个
          if (options.length > 0 && options[0]) {
            produceStore.setProcessOption(options[0])
            produceStore.setPrice(options[0].price)
            produceStore.setDiscountedPrice(options[0]?.discountedPrice)
          }
        }
      } catch (error) {
        console.error('获取模板详情失败:', error)
      }
    } else {
      // 如果没有模板ID，使用默认选项
      const defaultOptions: ProcessOption[] = [
        {
          default: true,
          duration: '20min',
          price: price.value || 0.01,
          processType: '快速加工',
          taskType: 'fast',
        },
        {
          default: false,
          duration: '40min',
          price: (price.value || 0.01) * 1.5,
          processType: '精制加工',
          taskType: 'precise',
        },
      ]
      currentProcessOptions.value = defaultOptions
      if (defaultOptions[0]) {
        produceStore.setProcessOption(defaultOptions[0])
      }
    }
  } else {
    // 如果没有产品图片，使用默认选项
    const defaultOptions: ProcessOption[] = [
      {
        default: true,
        duration: '20min',
        price: 0.01,
        processType: '快速加工',
        taskType: 'fast',
      },
      {
        default: false,
        duration: '40min',
        price: 0.015,
        processType: '精制加工',
        taskType: 'precise',
      },
    ]
    currentProcessOptions.value = defaultOptions
    if (defaultOptions[0]) {
      produceStore.setProcessOption(defaultOptions[0])
    }
  }
}

// 选择加工选项
const onProcessOptionClick = (option: ProcessOption) => {
  produceStore.setProcessOption(option)
  produceStore.setPrice(option.price)
  produceStore.setDiscountedPrice(option?.discountedPrice)
}

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    produceStore.setQuantity(quantity.value - 1)
  }
}

// 增加数量
const increaseQuantity = () => {
  if (quantity.value >= 1) {
    showToast('已达到最大数量')
    return
  }
  produceStore.setQuantity(quantity.value + 1)
}

// 跳转到支付页面
const goPayPage = () => {
  if (!processOption.value) {
    showFailToast('未找到加工选项, 请重新选择')
    return
  }

  router.push('/produce/pay')
}

onMounted(() => {
  initProcessOptions()
})
</script>

<style scoped>
.config-page {
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

/* 产品展示区域 */
.product-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 32vh;
  max-height: 300px;
  margin-bottom: 16px;
  background: #363636;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 价格和数量 */
.price-quantity-section {
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 16px;
}

.price-section {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 20px;
  font-weight: bold;
  color: rgb(250, 204, 21);
  margin-right: 4px;
}

.price-value {
  font-size: 40px;
  font-weight: bold;
  color: rgb(250, 204, 21);
  margin-right: 8px;
}

.original-price {
  font-size: 14px;
  color: rgb(156, 163, 175);
  text-decoration: line-through;
}

.quantity-section {
  display: flex;
  height: 60px;
  align-items: center;
}

.quantity-label {
  font-size: 16px;
  color: #fff;
  margin-right: 8px;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #333;
  border-radius: 4px;
  cursor: pointer;
}

.quantity-value {
  width: 28px;
  height: 28px;
  padding: 3px;
  margin: 0 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #333;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
}

/* 配置选项 */
.config-section {
  padding: 0 16px;
}

.process-time-section {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 11px;
  font-size: 14px;
  color: #fff;
  gap: 8px;
}

.process-options {
  display: flex;
  gap: 8px;
}

.process-option {
  width: 48%;
  padding: 8px 15px;
  border: 1px solid #2f2f2f;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.process-option.active {
  border-color: #fff;
}

.process-option.active .option-name {
  color: #fff;
}

.option-name {
  font-size: 14px;
  font-weight: 500;
  color: #929292;
  margin-bottom: 12px;
}

.option-duration {
  font-size: 12px;
  color: #929292;
}

/* NFC功能 */
.nfc-section {
  padding: 0 5px;
  margin-bottom: 25px;
}

/* 底部按钮 */
.bottom-actions {
  padding: 16px 15px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: #0d0d0d;
  z-index: 10;
}

.order-button {
  width: 100%;
  border-radius: 16px;
  height: 44px;
}

.order-button-text {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}
</style>
