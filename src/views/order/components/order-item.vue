<template>
  <div class="order-item">
    <div class="order-header" @click="onItemClick">
      <!-- 第一行：订单名称 + 订单状态 -->
      <div class="order-title-row">
        <span class="order-name">{{ order?.productName || '平雕圆形纪念币' }}</span>
        <span class="order-status">{{ orderStatusText }}</span>
      </div>

      <!-- 第二行：产品图 + 中间标签区 + 右边价格区 -->
      <div class="order-content">
        <!-- 左边：产品图 -->
        <div class="product-image">
          <img
            :src="order?.asset?.generatedImageUrl || '/static/img/default.png'"
            alt="product"
            class="product-img"
          />
        </div>

        <!-- 中间：标签区 -->
        <div class="order-info">
          <div class="tags-row">
            <span v-if="hasNfcContent" class="tag">NFC</span>
            <span class="tag">{{ order.asset.processingConfig?.processType || '未命名工艺' }}</span>
            <span class="tag">x{{ order?.quantity || 1 }}</span>
          </div>
          <!-- 订单编号 -->
          <div class="order-sn-container" @click.stop="copyOrderSn">
            <div class="order-sn-label-row">
              <span class="order-sn-label">订单编号</span>
              <img src="@/assets/copy.svg" alt="copy" class="copy-icon" />
            </div>
            <span class="order-sn">#{{ order?.orderSn || '792837459723485' }}</span>
          </div>
        </div>

        <!-- 右边：价格区 -->
        <div class="price-section">
          <span class="price">¥{{ order?.payAmount || 1 }}</span>
          <span v-if="order?.amount && order?.amount > order?.payAmount" class="original-price">
            ¥{{ order.amount }}
          </span>
        </div>
      </div>
    </div>

    <!-- 待支付 -->
    <div v-if="isPendingOrder" class="order-actions">
      <span class="time-left">剩余时间 {{ timeLeft || '14m59s' }}</span>
      <div class="action-buttons">
        <button type="button" class="cancel-button" @click="showCancelModal">取消订单</button>
        <van-button type="primary" size="small" @click="handleContinuePay">继续支付</van-button>
      </div>
    </div>

    <!-- 排单中 -->
    <div v-if="isPaidOrder" class="order-actions">
      <span></span>
      <div class="action-buttons">
        <button type="button" class="after-service-button" @click="goAfterServicePage">
          申请售后
        </button>
      </div>
    </div>

    <!-- 待取件 -->
    <div v-if="isReadyForPickupOrder" class="order-actions">
      <span></span>
      <div class="action-buttons">
        <van-button type="primary" size="small" @click="showPickupModal">取件码</van-button>
      </div>
    </div>

    <!-- 滞留 -->
    <div v-if="isDetainOrder" class="order-actions">
      <span></span>
      <div class="action-buttons">
        <van-button type="primary" size="small" @click="confirmReceive">确认收货</van-button>
      </div>
    </div>

    <!-- 已完成或已关闭 -->
    <div
      v-if="order?.status === OrderStatus.CLOSED || order?.status === OrderStatus.COMPLETED"
      class="order-actions"
    >
      <span></span>
      <div class="action-buttons">
        <van-icon name="delete-o" size="20" color="#757575" @click="deleteOrder" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { OrderStatus, type Order } from '@/types/order'
import { cancelOrder, deleteOrder as deleteOrderAPI, confirmPickup } from '@/api/order'
import {
  showConfirmDialog,
  showSuccessToast,
  showFailToast,
  showLoadingToast,
  closeToast,
} from 'vant'

const props = defineProps<{
  order: Order
}>()

const emit = defineEmits<{
  refreshList: []
  showPickupModal: [order: Order]
}>()

const router = useRouter()

const timeLeft = ref('')
const isExpired = ref(false)
const timer = ref<number | null>(null)

const hasNfcContent = computed(() => {
  const nfc = props.order?.asset?.nfcContent
  return nfc != null && Object.keys(nfc).length > 0
})

const orderStatusText = computed(() => {
  return getOrderStatus(props.order?.status)
})

const isPendingOrder = computed(() => props.order?.status === OrderStatus.PENDING)
const isPaidOrder = computed(() => props.order?.status === OrderStatus.PAID)
const isReadyForPickupOrder = computed(() => props.order?.status === OrderStatus.READY_FOR_PICKUP)
const isDetainOrder = computed(() => props.order?.status === OrderStatus.DETAIN)

function getOrderStatus(status: number) {
  switch (status) {
    case OrderStatus.PENDING:
      return '待付款'
    case OrderStatus.PAID:
      return '排单中'
    case OrderStatus.PROCESSING:
      return '生产中'
    case OrderStatus.READY_FOR_PICKUP:
      return '待取货'
    case OrderStatus.COMPLETED:
      return '订单完成'
    case OrderStatus.CLOSED:
      return '订单关闭'
    case OrderStatus.ERROR:
      return '订单异常'
    case OrderStatus.DETAIN:
      return '订单滞留'
    default:
      return '未知状态'
  }
}

function calculateTimeLeft() {
  if (!props.order?.createdAt) {
    return
  }

  const now = new Date().getTime()
  const dateString = props.order.createdAt.replace(' ', 'T')
  const created = new Date(dateString).getTime()

  const validitySeconds = 30 * 60 // 30分钟有效期
  const expireTime = created + validitySeconds * 1000
  const remaining = expireTime - now

  if (remaining <= 0) {
    timeLeft.value = '已过期'
    isExpired.value = true
    clearTimer()
    return
  }

  const minutes = Math.floor(remaining / (1000 * 60))
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

  timeLeft.value = `${minutes}m${seconds.toString().padStart(2, '0')}s`
  isExpired.value = false
}

function startTimer() {
  clearTimer()
  calculateTimeLeft()
  timer.value = window.setInterval(() => {
    calculateTimeLeft()
  }, 1000)
}

function clearTimer() {
  if (timer.value !== null) {
    clearInterval(timer.value)
    timer.value = null
  }
}

function onItemClick() {
  const orderSn = props.order?.orderSn
  const status = props.order.status

  if (props.order && orderSn) {
    if (status === OrderStatus.PENDING || status === OrderStatus.CLOSED) {
      showFailToast('当前订单状态无法查看详情')
      return
    }

    router.push(`/order/detail?orderSn=${orderSn}`)
  }
}

function showCancelModal() {
  showConfirmDialog({
    title: '取消订单',
    message: '确定要取消此订单吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(async () => {
      if (props.order?.orderSn) {
        try {
          const res = await cancelOrder(props.order.orderSn)
          if (res.code === 0) {
            showSuccessToast('订单已取消')
            setTimeout(() => {
              emit('refreshList')
            }, 500)
          } else {
            showFailToast(res.message || '取消订单失败')
          }
        } catch (error) {
          console.error('取消订单失败:', error)
          showFailToast('取消订单失败，请稍后重试')
        }
      }
    })
    .catch(() => {
      // 用户取消
    })
}

function handleContinuePay() {
  if (!props.order?.orderSn) {
    showFailToast('订单号不存在')
    return
  }

  if (isExpired.value) {
    showFailToast('订单已过期，无法支付')
    return
  }

  // TODO: 实现支付逻辑
  showFailToast('支付功能暂未实现')
}

function goAfterServicePage() {
  if (!props.order) return
  const orderSn = props.order.orderSn
  const payAmount = props.order?.payAmount

  router.push(`/order/after-service?orderSn=${orderSn}&payAmount=${payAmount}`)
}

function showPickupModal() {
  if (!props.order?.pickupCode) {
    showFailToast('获取取件码失败，请联系客服')
    return
  }

  emit('showPickupModal', props.order)
}

async function confirmReceive() {
  if (!props.order?.orderSn) return
  try {
    showLoadingToast({
      message: '确认中...',
      forbidClick: true,
    })
    const res = await confirmPickup(props.order.orderSn)
    if (res.code === 0) {
      closeToast()
      showSuccessToast('确认成功')
      emit('refreshList')
    } else {
      closeToast()
      showFailToast(res.message || '确认失败')
    }
  } catch (error) {
    closeToast()
    console.error('确认收货失败:', error)
    showFailToast('确认失败，请稍后重试')
  }
}

function deleteOrder() {
  showConfirmDialog({
    title: '删除订单',
    message: '确定要删除此订单吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(async () => {
      if (props.order?.orderSn) {
        try {
          const res = await deleteOrderAPI(props.order.orderSn)
          if (res.code === 0 && res.data?.isSuccess) {
            showSuccessToast('订单已删除')
            emit('refreshList')
          } else {
            showFailToast('删除订单失败')
          }
        } catch (error) {
          console.error('删除订单失败:', error)
          showFailToast('删除订单失败')
        }
      }
    })
    .catch(() => {
      // 用户取消
    })
}

function copyOrderSn() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(props.order?.orderSn || '').then(() => {
      showSuccessToast('复制订单号成功')
    })
  } else {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = props.order?.orderSn || ''
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      showSuccessToast('复制订单号成功')
    } catch {
      showFailToast('复制失败')
    }
    document.body.removeChild(textArea)
  }
}

watch(
  () => props.order.createdAt,
  () => {
    if (isPendingOrder.value) {
      startTimer()
    }
  },
  { immediate: true },
)

watch(isPendingOrder, (newVal) => {
  if (newVal) {
    startTimer()
  } else {
    clearTimer()
  }
})

onMounted(() => {
  if (isPendingOrder.value) {
    startTimer()
  }
})

onUnmounted(() => {
  clearTimer()
})
</script>

<style scoped>
.order-item {
  background: #232323;
  border-radius: 16px;
  padding: 15px;
  margin-bottom: 16px;
}

.order-header {
  cursor: pointer;
}

.order-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.order-name {
  font-size: 18px;
  font-weight: bold;
  color: #ccc;
}

.order-status {
  font-size: 14px;
  font-weight: 500;
  color: #fada39;
}

.order-content {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  position: relative;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  flex-shrink: 0;
  overflow: hidden;
  background: #363636;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 80px;
  justify-content: space-between;
}

.tags-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 3px;
}

.tag {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.55);
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 8px;
}

.order-sn-container {
  cursor: pointer;
}

.order-sn-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-sn-label {
  font-size: 14px;
  color: #fff;
}

.copy-icon {
  width: 14px;
  height: 14px;
}

.order-sn {
  display: block;
  font-size: 14px;
  color: #757575;
  margin-top: 0;
}

.price-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.price {
  font-size: 20px;
  color: #fff;
  font-weight: bold;
  line-height: 1;
}

.original-price {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: line-through;
  margin-top: 2px;
}

.order-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.time-left {
  font-size: 14px;
  color: #d4791e;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-button {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.after-service-button {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}

:deep(.van-button--primary) {
  background: #fada39;
  border: none;
  color: #0a0a0a;
  font-weight: 500;
  font-size: 14px;
  height: 30px;
  padding: 0 10px;
  border-radius: 10px;
}
</style>
