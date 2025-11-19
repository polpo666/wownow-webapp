<template>
  <div class="asset-detail-page">
    <!-- 背景 -->
    <div class="bg-cover"></div>

    <!-- 导航栏 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" size="20" color="#fff" @click="goBack" />
      <span class="nav-title">资产详情</span>
      <div class="nav-placeholder"></div>
    </div>

    <!-- 图片区域 -->
    <div class="image-section">
      <img
        v-if="asset?.generatedImageUrl"
        :src="asset.generatedImageUrl"
        alt="asset"
        class="asset-image"
      />
      <div v-else class="no-image">
        <span class="no-image-text">暂无图片</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-section">
      <van-button type="primary" block class="action-button" @click="onCreate">
        我要二创
      </van-button>
      <van-button type="primary" block class="action-button" @click="onProduction">
        直接下单
      </van-button>
      <van-button type="primary" class="delete-button" @click="deleteAsset">
        <van-icon name="delete-o" size="20" color="#ff4d4f" />
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAssetDetail, deleteAsset as deleteAssetAPI } from '@/api/asset'
import type { Asset } from '@/types/asset'
import {
  showConfirmDialog,
  showSuccessToast,
  showFailToast,
  showLoadingToast,
  closeToast,
} from 'vant'

const route = useRoute()
const router = useRouter()

const asset = ref<Asset | null>(null)
const isLoading = ref(false)

// 加载资产详情
const loadAssetDetail = async (id: number) => {
  try {
    isLoading.value = true
    const res = await getAssetDetail(id)
    if (res.code === 0 && res.data) {
      asset.value = res.data
    } else {
      showFailToast(res.message || '加载失败')
    }
  } catch (error) {
    console.error('加载资产详情失败:', error)
    showFailToast('加载失败')
  } finally {
    isLoading.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 我要二创
const onCreate = () => {
  if (!asset.value) {
    showFailToast('资产详情未加载完成，请稍后再试')
    return
  }
  // TODO: 实现二创逻辑
  router.push('/chat')
}

// 直接下单
const onProduction = () => {
  if (isLoading.value || !asset.value) {
    showFailToast('资产详情未加载完成，请稍后再试')
    return
  }
  // TODO: 实现下单逻辑
  router.push('/produce')
}

// 删除资产
const handleDeleteAsset = async () => {
  if (!asset.value?.id) return

  try {
    showLoadingToast({
      message: '删除中...',
      forbidClick: true,
    })

    const res = await deleteAssetAPI(asset.value.id)

    if (res.code === 0) {
      closeToast()
      showSuccessToast('资产已删除')
      setTimeout(() => {
        router.back()
      }, 1500)
    } else {
      closeToast()
      showFailToast('删除资产失败')
    }
  } catch (error) {
    closeToast()
    console.error('删除资产失败:', error)
    showFailToast('删除资产失败')
  }
}

const deleteAsset = async () => {
  try {
    await showConfirmDialog({
      title: '删除资产',
      message: '确定要删除此资产吗？',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    })
    await handleDeleteAsset()
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  const id = route.query.id
  if (id) {
    loadAssetDetail(Number(id))
  }
})
</script>

<style scoped>
.asset-detail-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
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

/* 图片区域 */
.image-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  min-height: calc(100vh - 44px - 80px);
}

.asset-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.no-image {
  color: #999;
  font-size: 14px;
}

.no-image-text {
  color: #999;
}

/* 操作按钮 */
.action-section {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
}

.action-button {
  flex: 1;
  height: 48px;
  border-radius: 12px;
}

.delete-button {
  width: 48px;
  height: 48px;
  background: #232323;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.van-button--primary) {
  background: #fada39;
  border: none;
  color: #0a0a0a;
  font-weight: 500;
}

:deep(.delete-button.van-button--primary) {
  background: #232323;
}
</style>
