<template>
  <div class="assets-page">
    <!-- 背景 -->
    <div class="bg-cover"></div>

    <!-- 导航栏 -->
    <div class="nav-bar">
      <div class="nav-placeholder"></div>
      <span class="nav-title">我的资产</span>
      <div class="nav-placeholder"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 未登录状态 -->
      <div v-if="!isLoggedIn" class="empty-state">
        <div class="empty-content">
          <p class="empty-text">您还没有登录，请登录后查看资产</p>
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
          <div v-for="i in 8" :key="i" class="skeleton-item">
            <div class="skeleton-image"></div>
            <div class="skeleton-text">
              <div class="skeleton-line"></div>
              <div class="skeleton-tag"></div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="isEmpty" class="empty-state">
          <div class="empty-content">
            <img src="@/assets/base/no-data.png" alt="empty" class="empty-image" />
            <p class="empty-title">暂无资产记录</p>
            <p class="empty-desc">这里将保存你下单生成的作品</p>
            <p class="empty-desc">方便随时查看与管理</p>
            <van-button type="primary" class="create-button" @click="goCreatePage">
              马上创建作品
            </van-button>
          </div>
        </div>

        <!-- 资产列表 -->
        <template v-else>
          <div class="asset-list">
            <div
              v-for="item in assetList"
              :key="item.id"
              class="asset-item"
              @click="handleAssetClick(item)"
            >
              <!-- 图片区域 -->
              <div class="asset-image-wrapper">
                <img
                  v-if="item.generatedImageUrl"
                  :src="item.generatedImageUrl"
                  alt="asset"
                  class="asset-image"
                />
                <img
                  v-else
                  src="@/assets/svgs/image-placeholder.svg"
                  alt="placeholder"
                  class="asset-placeholder"
                />
              </div>

              <!-- 文字区域 -->
              <div class="asset-info">
                <span class="asset-name">{{ item.name || '未命名资产' }}</span>
                <span class="asset-tag">{{ item.craftType || '未命名工艺' }}</span>
              </div>
            </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getAssetList } from '@/api/asset'
import type { Asset } from '@/types/asset'
import { showFailToast, showSuccessToast } from 'vant'

const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const assetList = ref<Asset[]>([])
const isLoading = ref(true)
const refreshing = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const showSkeleton = computed(() => isLoading.value && assetList.value.length === 0)
const isEmpty = computed(() => !isLoading.value && assetList.value.length === 0)
const noMoreData = computed(() => !hasMore.value && assetList.value.length > 0)
const loading = computed(() => isLoading.value || loadingMore.value)
const isAtTop = ref(true)

// 加载资产列表
const loadAssetList = async (isFirstPage = false, showSuccessToastFlag = false) => {
  try {
    if (isFirstPage) {
      isLoading.value = true
      currentPage.value = 1
      hasMore.value = true
    } else {
      loadingMore.value = true
    }

    const res = await getAssetList({
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    const list = res.data?.list || []
    const totalCount = res.data?.totalCount || 0

    if (res.code === 0) {
      if (isFirstPage) {
        assetList.value = list
      } else {
        assetList.value = [...assetList.value, ...list]
      }

      total.value = totalCount
      hasMore.value = assetList.value.length < totalCount

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
      showFailToast(res.message || '获取资产列表失败')
    }
  } catch (error) {
    console.error('加载资产列表失败:', error)
    showFailToast('加载失败')
  } finally {
    isLoading.value = false
    loadingMore.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  loadAssetList(true, true)
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
      loadAssetList(false)
    }
  }
}

// 点击资产项
const handleAssetClick = (item: Asset) => {
  if (item.id) {
    router.push(`/assets/detail?id=${item.id}`)
  }
}

// 跳转到创建页面
const goCreatePage = () => {
  router.push('/create')
}

onMounted(async () => {
  if (isLoggedIn.value) {
    loadAssetList(true)
  }
  // 等待 DOM 渲染完成后检测滚动位置
  await nextTick()
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  // 也监听 touchmove 事件，确保在移动端也能正确检测
  window.addEventListener('touchmove', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('touchmove', handleScroll)
})
</script>

<style scoped>
.assets-page {
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 15px;
}

.skeleton-item {
  background: #2b2b2b;
  border-radius: 12px;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  padding-bottom: 100%;
  background: #1a1a1a;
  position: relative;
  overflow: hidden;
}

.skeleton-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.skeleton-text {
  padding: 9px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.skeleton-line {
  height: 13px;
  background: #404040;
  border-radius: 4px;
  flex: 1;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-tag {
  height: 10px;
  width: 40px;
  background: #404040;
  border-radius: 4px;
  animation: skeleton-loading 1.5s infinite;
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

/* 资产列表 */
.asset-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 15px;
}

.asset-item {
  background: #2b2b2b;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.asset-item:active {
  transform: scale(0.95);
}

.asset-image-wrapper {
  width: 100%;
  padding-bottom: 100%;
  position: relative;
  background: #1a1a1a;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.asset-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asset-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  opacity: 0.6;
}

.asset-info {
  padding: 9px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.asset-name {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-tag {
  font-size: 10px;
  color: #d1d5db;
  padding: 3px 5px;
  border: 1px solid #575757;
  border-radius: 8px;
  flex-shrink: 0;
  margin-left: 4px;
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
