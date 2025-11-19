<template>
  <van-popup
    v-model:show="showModal"
    position="bottom"
    :close-on-click-overlay="false"
    :style="{ background: 'transparent' }"
    :z-index="99999"
    @close="onClose"
  >
    <div class="pickup-modal">
      <div class="pickup-modal-header">
        <span class="header-title">取件码</span>
      </div>

      <!-- 主体内容 -->
      <div class="pickup-modal-content">
        <!-- 取件码数字 -->
        <div class="pickup-code-section">
          <span class="pickup-code">{{ order?.pickupCode || '无' }}</span>
        </div>

        <!-- 商品数量 -->
        <div class="quantity-section">
          <span class="quantity-label">商品数量：</span>
          <span class="quantity-value">{{ order?.quantity || 0 }}</span>
        </div>

        <!-- 机器信息 -->
        <div class="device-section">
          <div class="device-name">{{ order?.device?.deviceName || '暂无设备名' }}</div>
          <div class="device-address">{{ order?.device?.address || '暂无地址信息' }}</div>
        </div>

        <!-- 关闭按钮 -->
        <div class="close-section">
          <van-button type="primary" block class="close-button" @click="onClose">关闭</van-button>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Order } from '@/types/order'

const props = defineProps<{
  show: boolean
  order: Order | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  close: []
}>()

const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
})

const onClose = () => {
  emit('close')
  emit('update:show', false)
}
</script>

<style scoped>
.pickup-modal {
  border-radius: 35px 35px 0 0;
  margin: 0 16px;
  margin-top: 32px;
  position: relative;
  overflow: hidden;
}

.pickup-modal-header {
  width: 100%;
  height: 80px;
  position: relative;
  overflow: hidden;
  background-image: url('@/assets/bg-login.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 10px;
}

.header-title {
  font-size: 13px;
  font-weight: bold;
  color: #000;
}

.pickup-modal-content {
  background: #fcf9ee;
  border-radius: 0 0 35px 35px;
  padding: 24px 16px 50px;
}

.pickup-code-section {
  text-align: center;
  margin-bottom: 20px;
}

.pickup-code {
  font-size: 40px;
  font-weight: 900;
  color: #000;
  letter-spacing: 8px;
}

.quantity-section {
  font-size: 16px;
  color: #000;
  margin-bottom: 25px;
}

.quantity-label {
  color: #000;
}

.quantity-value {
  font-weight: 500;
}

.device-section {
  margin-bottom: 16px;
}

.device-name {
  font-size: 16px;
  color: #000;
  font-weight: 500;
  margin-bottom: 8px;
}

.device-address {
  font-size: 12px;
  color: #999;
  line-height: 18px;
}

.close-section {
  margin-top: 25px;
}

.close-button {
  background: #000;
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  height: 44px;
  border-radius: 15px;
}

:deep(.van-button--primary) {
  background: #000;
  border: none;
  color: #fff;
}
</style>
