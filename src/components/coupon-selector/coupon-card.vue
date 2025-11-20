<template>
  <div class="coupon-card">
    <div v-if="showMask" class="coupon-mask"></div>
    <div class="coupon-content" @click="onSelectCoupon">
      <div class="coupon-info">
        <div class="coupon-left">
          <div class="coupon-name">{{ coupon.name }}</div>
          <div class="coupon-validity">
            <span v-if="isValid" class="validity-text">{{ coupon.validEnd }}过期</span>
            <span v-else class="validity-text">{{ coupon.validStart }}可用</span>
          </div>
        </div>

        <div class="coupon-right">
          <!-- 满减券显示金额 -->
          <template v-if="coupon.type === 'cash'">
            <div class="coupon-amount">
              <span class="amount-symbol">¥</span>
              <span class="amount-value">{{ coupon.discountAmount }}</span>
            </div>
            <div class="threshold-text">满{{ coupon.thresholdAmount }}可用</div>
          </template>

          <!-- 折扣券显示百分比 -->
          <template v-else-if="coupon.type === 'discount'">
            <div class="discount-value">{{ 100 - coupon.discountRate }}%</div>
            <div class="discount-text">Off</div>
          </template>

          <!-- 免单券显示免费 -->
          <template v-else>
            <div class="coupon-amount">
              <span class="amount-symbol">¥</span>
              <span class="amount-value">0.01</span>
            </div>
            <div class="free-text">Free</div>
          </template>
        </div>
      </div>

      <!-- 选中状态指示器 -->
      <div class="select-indicator" :class="{ selected: isSelected }">
        <img
          v-if="isSelected"
          src="@/assets/svgs/icon-checked-white.svg"
          alt="selected"
          class="check-icon"
        />
      </div>
    </div>

    <div class="coupon-divider"></div>

    <div class="coupon-rules">
      <van-collapse v-model="activeName" :border="false">
        <van-collapse-item
          :title="unavailableReason ? `不可用原因：${unavailableReason}` : '使用规则'"
          :name="coupon.id"
          :border="false"
        >
          {{ coupon.description || '暂无使用说明' }}
        </van-collapse-item>
      </van-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ExtendedUserCoupon } from '@/types/promotion'

interface Props {
  coupon: ExtendedUserCoupon
  selectedIds?: number[]
  showMask?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedIds: () => [],
  showMask: false,
})

const emit = defineEmits<{
  select: [coupon: ExtendedUserCoupon]
}>()

const activeName = ref<number | null>(null)

const isValid = computed(() => {
  const today = Date.now()
  const validStart = new Date(props.coupon.validStart.replace(/-/g, '/')).getTime()
  return today >= validStart
})

const isSelected = computed(() => {
  return props.selectedIds.includes(props.coupon.id)
})

const unavailableReason = computed(() => {
  if (props.coupon.unavailableReasons && props.coupon.unavailableReasons.length > 0) {
    return props.coupon.unavailableReasons.join('；')
  }
  return ''
})

const onSelectCoupon = () => {
  if (!props.showMask) {
    emit('select', props.coupon)
  }
}
</script>

<style scoped>
.coupon-card {
  background: #fefbee;
  border-radius: 16px;
  margin-top: 12px;
  padding: 15px;
  position: relative;
}

.coupon-mask {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  z-index: 1;
}

.coupon-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 16px;
  cursor: pointer;
}

.coupon-info {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.coupon-left {
  flex: 1;
}

.coupon-name {
  font-size: 18px;
  font-weight: 500;
  color: #0a0a0a;
  line-height: 28px;
  word-break: break-all;
}

.coupon-validity {
  background: #ffeff2;
  padding: 4px 8px;
  border-radius: 10px;
  margin-top: 4px;
  display: inline-block;
}

.validity-text {
  font-size: 12px;
  font-weight: 500;
  color: #ee3154;
  line-height: normal;
}

.coupon-right {
  flex-shrink: 0;
  text-align: center;
}

.coupon-amount {
  color: #ee3154;
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.amount-symbol {
  font-size: 18px;
  margin-right: 4px;
}

.amount-value {
  font-size: 28px;
  font-weight: 500;
  line-height: 28px;
}

.threshold-text,
.free-text {
  font-size: 13px;
  font-weight: 500;
  color: #ee3154;
  line-height: normal;
  margin-top: 2px;
}

.discount-value {
  color: #ee3154;
  font-size: 24px;
  font-weight: 600;
  line-height: 23px;
}

.discount-text {
  color: #ee3154;
  font-size: 13px;
  font-weight: 500;
  line-height: normal;
  text-align: center;
  margin-top: 2px;
}

.select-indicator {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #e2e2e2;
  transition: all 0.2s;
}

.select-indicator.selected {
  background: #fada39;
  border-color: #fada39;
}

.check-icon {
  width: 100%;
  height: 100%;
}

.coupon-divider {
  width: 100%;
  height: 1px;
  background: #e2e2e2;
  margin-bottom: 12px;
}

.coupon-rules {
  position: relative;
  z-index: 50;
  width: 100%;
}

.coupon-rules :deep(.van-collapse) {
  background: transparent;
}

.coupon-rules :deep(.van-cell) {
  padding: 0;
  font-size: 13px;
  background: transparent;
}

.coupon-rules :deep(.van-collapse-item__content) {
  background-color: transparent;
  padding: 0;
  font-size: 13px;
  color: #9c9c9c;
}

.coupon-rules :deep(.van-cell__title) {
  color: #9c9c9c;
}
</style>
