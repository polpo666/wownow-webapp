<template>
  <div class="order-page">
    <!-- 背景 -->
    <div class="bg-cover"></div>

    <!-- 导航栏 -->
    <div class="nav-bar">
      <div class="nav-placeholder"></div>
      <span class="nav-title">我的订单</span>
      <div class="nav-placeholder"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 未登录状态 -->
      <div v-if="!isLoggedIn" class="empty-state">
        <div class="empty-content">
          <p class="empty-text">您还没有登录，请登录后查看订单</p>
        </div>
      </div>

      <!-- 已登录状态 -->
      <van-pull-refresh
        v-else
        v-model="refreshing"
        @refresh="onRefresh"
        :disabled="loading || !isAtTop"
      >
        <!-- 骨架屏 -->
        <div v-if="showSkeleton" class="skeleton-container">
          <div v-for="i in 4" :key="i" class="skeleton-item">
            <div class="skeleton-header">
              <div class="skeleton-line skeleton-title"></div>
              <div class="skeleton-line skeleton-status"></div>
            </div>
            <div class="skeleton-content">
              <div class="skeleton-image"></div>
              <div class="skeleton-info">
                <div class="skeleton-line"></div>
                <div class="skeleton-line skeleton-short"></div>
                <div class="skeleton-line skeleton-short"></div>
              </div>
            </div>
            <div class="skeleton-footer">
              <div class="skeleton-button"></div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="isEmpty" class="empty-state">
          <div class="empty-content">
            <img src="@/assets/base/no-data.png" alt="empty" class="empty-image" />
            <p class="empty-title">暂无订单</p>
            <p class="empty-desc">这里会展示你所有的订单记录和</p>
            <p class="empty-desc">状态，方便查看进度与售后</p>
            <van-button type="primary" class="create-button" @click="goCreatePage">
              马上创建作品
            </van-button>
          </div>
        </div>

        <!-- 订单列表 -->
        <template v-else>
          <div class="order-list">
            <order-item
              v-for="item in orderList"
              :key="item.id"
              :order="item"
              @refresh-list="handleRefreshList"
              @show-pickup-modal="onShowPickupModal"
            />
          </div>

          <!-- 加载更多状态 -->
          <div v-if="loadingMore" class="loading-more">
            <van-loading type="spinner" size="16px" color="#999" />
            <span class="loading-text">加载中...</span>
          </div>

          <!-- 没有更多数据 -->
          <div v-else-if="noMoreData" class="no-more">
            <span class="no-more-text">没有更多数据了</span>
          </div>
        </template>
      </van-pull-refresh>
    </div>

    <!-- 取件码弹窗 -->
    <pickup-modal
      v-model:show="isShowPickupModal"
      :order="selectedOrder"
      @close="onClosePickupModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getOrderList } from '@/api/order'
import type { Order } from '@/types/order'
import { showFailToast, showSuccessToast } from 'vant'
import OrderItem from './components/order-item.vue'
import PickupModal from './components/pickup-modal.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const orderList = ref<Order[]>([])
const isLoading = ref(true)
const refreshing = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const showEmpty = ref(false)
const isShowPickupModal = ref(false)
const selectedOrder = ref<Order | null>(null)
const isAtTop = ref(true)

const showSkeleton = computed(() => isLoading.value && orderList.value.length === 0)
const isEmpty = computed(() => !isLoading.value && showEmpty.value)
const noMoreData = computed(() => !hasMore.value && orderList.value.length > 0)
const loading = computed(() => isLoading.value || loadingMore.value)

// 加载订单列表
const loadOrderList = async (isFirstPage = false, showSuccessToastFlag = false) => {
  try {
    if (isFirstPage) {
      isLoading.value = true
      currentPage.value = 1
      hasMore.value = true
      showEmpty.value = false
    } else {
      loadingMore.value = true
    }

    const res = await getOrderList({
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    const list = res.data?.list || []
    const totalCount = res.data?.totalCount || 0

    if (res.code === 0) {
      if (isFirstPage) {
        orderList.value = list
      } else {
        orderList.value = [...orderList.value, ...list]
      }

      total.value = totalCount
      hasMore.value = orderList.value.length < totalCount
      showEmpty.value = orderList.value.length === 0

      if (list.length > 0) {
        currentPage.value++
      }

      // 只有在手动下拉刷新时才显示成功提示
      if (showSuccessToastFlag) {
        setTimeout(() => {
          showSuccessToast('刷新成功')
        }, 200)
      }
    } else {
      showFailToast(res.message || '获取订单失败')
      if (isFirstPage && orderList.value.length === 0) {
        showEmpty.value = true
      }
    }
  } catch (error) {
    console.error('加载订单列表失败:', error)
    showFailToast('加载失败')
    if (isFirstPage && orderList.value.length === 0) {
      showEmpty.value = true
    }
  } finally {
    isLoading.value = false
    loadingMore.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  loadOrderList(true, true)
}

// 触底加载更多和检测是否在顶部
const handleScroll = () => {
  const scrollElement = document.documentElement || document.body
  const scrollTop = scrollElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = scrollElement.scrollHeight

  // 检测是否在顶部（允许 5px 的误差）
  isAtTop.value = scrollTop <= 5

  // 触底加载更多
  if (scrollTop + windowHeight >= documentHeight - 100) {
    if (!loadingMore.value && hasMore.value) {
      loadOrderList(false)
    }
  }
}

// 刷新列表
const handleRefreshList = () => {
  loadOrderList(true)
}

// 显示取件码弹窗
const onShowPickupModal = (order: Order) => {
  selectedOrder.value = order
  isShowPickupModal.value = true
}

// 关闭取件码弹窗
const onClosePickupModal = () => {
  isShowPickupModal.value = false
  selectedOrder.value = null
}

// 跳转到创建页面
const goCreatePage = () => {
  router.push('/create')
}

onMounted(async () => {
  if (isLoggedIn.value) {
    loadOrderList(true)
  }
  // 等待 DOM 渲染完成后检测滚动位置
  await nextTick()
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('touchmove', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('touchmove', handleScroll)
})
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  position: relative;
  overflow-y: auto;
}

/* 背景 */
.bg-cover {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/bg.jpg');
  background-size: cover;
  background-position: center;
  z-index: -1;
}

/* 导航栏 */
.nav-bar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.nav-title {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  flex: 1;
  text-align: center;
}

.nav-placeholder {
  width: 20px;
}

/* 内容区域 */
.content-wrapper {
  min-height: calc(100vh - 44px);
  padding-bottom: 20px;
}

/* 骨架屏 */
.skeleton-container {
  padding: 15px;
}

.skeleton-item {
  background: #2b2b2b;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
}

.skeleton-header {
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #404040;
}

.skeleton-title {
  height: 18px;
  width: 200px;
}

.skeleton-status {
  height: 14px;
  width: 60px;
}

.skeleton-content {
  padding: 10px 15px;
  display: flex;
  gap: 10px;
}

.skeleton-image {
  width: 80px;
  height: 80px;
  background: #404040;
  border-radius: 16px;
  flex-shrink: 0;
}

.skeleton-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 14px;
  background: #404040;
  border-radius: 4px;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-short {
  width: 60%;
}

.skeleton-footer {
  padding: 10px 15px 15px;
  display: flex;
  justify-content: flex-end;
}

.skeleton-button {
  height: 28px;
  width: 80px;
  background: #404040;
  border-radius: 8px;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 44px);
  padding: 20px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-image {
  width: 120px;
  height: 120px;
  margin-bottom: 15px;
}

.empty-title {
  font-size: 20px;
  color: #fff;
  margin: 0 0 5px 0;
}

.empty-desc {
  font-size: 14px;
  color: #929292;
  margin: 5px 0;
}

.create-button {
  margin-top: 25px;
  font-size: 14px;
}

/* 订单列表 */
.order-list {
  padding: 15px;
}

/* 加载更多 */
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 0 10px;
  color: #999;
  font-size: 13px;
}

.loading-text {
  color: #999;
  font-size: 13px;
}

/* 没有更多数据 */
.no-more {
  display: flex;
  justify-content: center;
  padding: 16px 0 10px;
}

.no-more-text {
  color: #666;
  font-size: 12px;
  word-break: break-word;
  white-space: normal;
  text-align: center;
  line-height: 1.5;
}

:deep(.van-pull-refresh) {
  min-height: calc(100vh - 44px);
}

:deep(.van-button--primary) {
  background: #fada39;
  border: none;
  color: #0a0a0a;
  font-weight: 500;
}
</style>
