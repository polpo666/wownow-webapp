<template>
  <div class="coupon-selector">
    <div class="selector-content">
      <!-- 可使用优惠券标题 -->
      <div class="section-header">
        <span class="section-title">可使用优惠券</span>
        <img src="@/assets/svgs/icon-ticket.svg" class="ticket-icon" alt="ticket" />
      </div>

      <!-- 无可用优惠券 -->
      <div
        v-if="availableCoupons.length === 0"
        class="empty-state"
        :class="{ 'has-unavailable': unavailableCoupons.length > 0 }"
      >
        <img
          src="@/assets/base/no-data.png"
          :class="unavailableCoupons.length > 0 ? 'empty-image-small' : 'empty-image'"
          alt="no data"
        />
        <span class="empty-text">暂无优惠券可用</span>
      </div>

      <!-- 可使用优惠券列表 -->
      <coupon-card
        v-for="coupon in availableCoupons"
        :key="coupon.id"
        :coupon="coupon"
        :selected-ids="selectedIds"
        @select="handleSelectCoupon"
      />

      <!-- 不可使用优惠券 -->
      <template v-if="unavailableCoupons.length > 0">
        <div class="section-header unavailable-header">
          <span class="section-title">不可使用优惠券</span>
          <img src="@/assets/svgs/icon-ticket.svg" class="ticket-icon" alt="ticket" />
        </div>

        <!-- 不可使用优惠券列表 -->
        <coupon-card
          v-for="coupon in unavailableCoupons"
          :key="coupon.id"
          :coupon="coupon"
          :show-mask="true"
        />
      </template>
    </div>

    <div class="selector-footer">
      <van-button block type="primary" color="#FADA39" class="confirm-button" @click="onConfirm">
        <span class="confirm-button-text">确认</span>
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getCouponList } from '@/api/promotion'
import type { ExtendedUserCoupon, UserCoupon } from '@/types/promotion'
import CouponCard from './coupon-card.vue'

interface Props {
  totalPrice: number
  templateId?: number
}

const props = withDefaults(defineProps<Props>(), {
  totalPrice: 0,
  templateId: 0,
})

const emit = defineEmits<{
  confirm: [coupons: UserCoupon[]]
}>()

const couponList = ref<ExtendedUserCoupon[]>([])
const selectedCoupons = ref<UserCoupon[]>([])

const availableCoupons = computed(() => {
  return couponList.value.filter(
    (c) => c.unavailableReasons === undefined || c.unavailableReasons.length === 0,
  )
})

const unavailableCoupons = computed(() => {
  return couponList.value.filter(
    (c) => c.unavailableReasons !== undefined && c.unavailableReasons.length > 0,
  )
})

const selectedIds = computed(() => {
  return selectedCoupons.value.map((coupon) => coupon.id)
})

const fetchUnusedCoupons = async () => {
  try {
    const res = await getCouponList({
      page: 1,
      pageSize: 100,
      status: 'unused',
    })
    if (res.code === 0 && res.data?.list) {
      const list = res.data.list as ExtendedUserCoupon[]
      for (const coupon of list) {
        const reasons = getUnavailableReasons(coupon)
        if (reasons.length > 0) {
          coupon.unavailableReasons = reasons
        }
      }
      couponList.value = list
    } else {
      console.warn('Failed to fetch unused coupons:', res.message)
    }
  } catch (error) {
    console.error('Failed to fetch unused coupons:', error)
  }
}

const getUnavailableReasons = (coupon: UserCoupon): string[] => {
  const reasons = []

  const today = Date.now()
  const validStart = new Date(coupon.validStart.replace(/-/g, '/')).getTime()

  // 1. 检查时间有效性
  if (today < validStart) {
    reasons.push('未到可用时间')
  }

  // 2. 检查使用门槛（仅对满减券）
  if (coupon.type === 'cash' && props.totalPrice < coupon.thresholdAmount) {
    reasons.push(`满${coupon.thresholdAmount}可用`)
  }

  // 3. 检查使用范围
  const scopeCheckResult = checkScopeDetail(coupon)
  if (scopeCheckResult !== '') {
    reasons.push(scopeCheckResult)
  }

  return reasons
}

const checkScopeDetail = (coupon: UserCoupon): string => {
  const rules = coupon.scopeJson?.rules || []

  if (rules.length === 0 || !props.templateId) {
    return ''
  }

  for (const rule of rules) {
    if (rule.targetType === 'template') {
      const templateIds = rule.values || []

      if (templateIds.length === 0) {
        continue // 无具体模板限制，跳过
      }

      if (rule.ruleType === 'inclusion') {
        // 包含规则：模板ID必须在允许的列表中
        if (!templateIds.includes(props.templateId)) {
          return '仅限部分品类可用'
        }
      } else if (rule.ruleType === 'exclusion') {
        // 排除规则：模板ID不能在排除的列表中
        if (templateIds.includes(props.templateId)) {
          return '当前品类不可用'
        }
      }
    }
  }

  return ''
}

const handleSelectCoupon = (targetCoupon: UserCoupon) => {
  if (!targetCoupon) return

  const isAlreadySelected = selectedCoupons.value.some((coupon) => coupon.id === targetCoupon.id)
  let newSelectedCoupons: UserCoupon[]

  // 可叠加的满减券，多选
  if (targetCoupon.stackable && targetCoupon.type === 'cash') {
    if (isAlreadySelected) {
      newSelectedCoupons = selectedCoupons.value.filter((item) => item.id !== targetCoupon.id)
    } else {
      // 检查是否可以与已选券叠加使用
      if (selectedCoupons.value.every((c) => c.stackable && c.type === 'cash')) {
        const stackedCoupons = [...selectedCoupons.value, targetCoupon]
        newSelectedCoupons = canStackCoupons(stackedCoupons) ? stackedCoupons : [targetCoupon]
      } else {
        newSelectedCoupons = [targetCoupon]
      }
    }
  } else {
    // 不可叠加，单选
    newSelectedCoupons = isAlreadySelected ? [] : [targetCoupon]
  }
  selectedCoupons.value = newSelectedCoupons
}

/**
 * 检查满减券是否可以叠加使用
 * 计算叠加后的实际支付金额是否仍满足每个券的使用门槛
 * @param coupons 要检查的优惠券列表
 * @returns 是否可以叠加
 */
const canStackCoupons = (coupons: UserCoupon[]): boolean => {
  if (coupons.length === 0) return true

  // 按使用门槛从高到低排序，优先使用门槛高的券
  const sortedCoupons = coupons
    .filter((c) => c.type === 'cash')
    .sort((a, b) => b.thresholdAmount - a.thresholdAmount)

  let remainingAmount = props.totalPrice

  for (const coupon of sortedCoupons) {
    // 检查当前剩余金额是否满足该券的使用门槛
    if (remainingAmount < coupon.thresholdAmount) {
      return false
    }
    // 使用该券后，减少相应金额
    remainingAmount -= coupon.thresholdAmount
  }

  return true
}

const onConfirm = () => {
  emit('confirm', selectedCoupons.value)
}

onMounted(() => {
  fetchUnusedCoupons()
})
</script>

<style scoped>
.coupon-selector {
  background: #232323;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.selector-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.section-header {
  display: flex;
  gap: 8px;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #d4d4d4;
}

.ticket-icon {
  width: 16px;
  height: 16px;
}

.unavailable-header {
  margin-top: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 120px;
}

.empty-state.has-unavailable {
  margin-top: 60px;
  margin-bottom: 60px;
}

.empty-image {
  width: 100px;
  height: 100px;
}

.empty-image-small {
  width: 80px;
  height: 80px;
}

.empty-text {
  font-size: 14px;
  color: #9c9c9c;
  margin-top: 12px;
}

.selector-footer {
  padding: 12px 15px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.confirm-button {
  width: 100%;
  border-radius: 16px;
  height: 44px;
  border: none;
}

.confirm-button-text {
  font-size: 16px;
  font-weight: 600;
  color: #0a0a0a;
}
</style>
