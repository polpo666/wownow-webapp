<template>
  <div class="template-page">
    <!-- 背景 -->
    <div class="bg-cover"></div>
    <!-- 导航栏 -->
    <van-nav-bar title="" left-arrow fixed placeholder @click-left="goBack" />

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-image"></div>
        <div class="loading-content">
          <div class="loading-header">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-price"></div>
          </div>
          <div class="skeleton-line skeleton-desc"></div>
          <div class="loading-tags">
            <div v-for="i in 4" :key="i" class="skeleton-tag"></div>
          </div>
        </div>
      </div>

      <!-- 模板详情 -->
      <template v-else>
        <!-- 图片轮播 -->
        <div class="swiper-container">
          <van-swipe
            :autoplay="0"
            :show-indicators="false"
            :loop="false"
            @change="onSwiperChange"
            :initial-swipe="currentSwiperIndex || 0"
          >
            <van-swipe-item v-for="(image, index) in swiperImages" :key="index" class="swiper-item">
              <img
                :src="image"
                :alt="`模板图片 ${index + 1}`"
                class="swiper-image"
                @click="previewImage(image)"
              />
            </van-swipe-item>
          </van-swipe>
          <!-- 自定义轮播指示器 -->
          <div class="swiper-indicator">{{ currentSwiperIndex + 1 }}/{{ swiperImages.length }}</div>
        </div>

        <!-- 模板信息 -->
        <div class="template-info">
          <div class="info-header">
            <h1 class="template-name">{{ templateDetail?.name || '' }}</h1>
            <div class="price-section">
              <template v-if="defaultOption?.discountedPrice">
                <!-- 折扣价 -->
                <span class="price-symbol">¥</span>
                <span class="price-value">{{ defaultOption.discountedPrice }}</span>
                <!-- 原价 -->
                <span class="original-price">¥{{ defaultOption?.price || 0.01 }}</span>
              </template>
              <template v-else>
                <span class="price-normal">¥{{ defaultOption?.price || 0.01 }}</span>
              </template>
            </div>
          </div>
          <p class="template-description">
            {{ templateDetail?.description || '暂无描述' }}
          </p>
          <div class="tag-list">
            <span v-for="tag in tagList" :key="tag.key" v-show="tag.value" class="tag-item">
              {{ tag.value }}
            </span>
          </div>
        </div>
      </template>
    </div>

    <!-- 底部按钮组 -->
    <div v-if="templateDetail" class="bottom-actions">
      <van-button block type="primary" class="action-button" @click="onCreate">
        我要二创
      </van-button>
      <van-button block type="primary" class="action-button" @click="handleProduction">
        直接下单
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getTemplateDetail } from '@/api/template'
import type { WownowTemplate } from '@/types/template'
import { useAuthStore } from '@/stores/auth'
import { showFailToast, showConfirmDialog } from 'vant'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const templateDetail = ref<WownowTemplate | null>(null)
const isLoading = ref(false)
const currentSwiperIndex = ref(0)

// 计算默认选项
const defaultOption = computed(() => {
  const options = templateDetail.value?.processOptions
  if (Array.isArray(options) && options.length > 0) {
    return options.find((opt) => opt && opt.default) || options[0] || null
  }
  return null
})

// 计算轮播图片列表
const swiperImages = computed(() => {
  if (!templateDetail.value) return []
  const images: string[] = []
  if (templateDetail.value.coverUrl) {
    images.push(templateDetail.value.coverUrl)
  }
  if (
    templateDetail.value.threeDimensionUrls &&
    templateDetail.value.threeDimensionUrls.length > 0
  ) {
    images.push(...templateDetail.value.threeDimensionUrls)
  }
  return images
})

// 计算标签列表
const tagList = computed(() => {
  const t = templateDetail.value
  if (!t) return []
  const labelSegments = t.label.split('-')
  const category = labelSegments[1] || labelSegments[0] || ''
  return [
    { key: 'materialDescription', value: t.materialDescription },
    { key: 'shapeSize', value: t.shapeSize },
    { key: 'category', value: category },
    { key: 'craftType', value: t.craftType },
    { key: 'styleName', value: t.styleName },
    { key: 'sceneDescription', value: t.sceneDescription },
  ]
})

// 获取模板详情
const fetchTemplateDetail = async (id: number) => {
  isLoading.value = true
  try {
    const response = await getTemplateDetail(id)
    if (response.code === 0 && response.data) {
      templateDetail.value = response.data
    } else {
      showFailToast('获取模板详情失败')
    }
  } catch (error) {
    console.error(error)
    showFailToast('获取模板详情失败')
  } finally {
    isLoading.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 预览图片
const previewImage = (current: string) => {
  if (!swiperImages.value || swiperImages.value.length === 0) return
  // 使用 Vant 的 ImagePreview 组件
  import('vant').then((vant) => {
    vant.showImagePreview({
      images: swiperImages.value,
      startPosition: swiperImages.value.indexOf(current),
    })
  })
}

// 轮播变化事件
const onSwiperChange = (index: number) => {
  currentSwiperIndex.value = index
}

// 检查认证
const checkAuthentication = async (): Promise<boolean> => {
  // 检查登录状态
  if (!authStore.isLoggedIn) {
    try {
      await showConfirmDialog({
        title: '提示',
        message: '您还未登录，请先登录',
        confirmButtonText: '登录',
        cancelButtonText: '取消',
      })
      authStore.setShowLoginModal(true)
    } catch {
      // 用户取消
    }
    return false
  }
  return true
}

// 我要二创
const onCreate = async () => {
  if (!(await checkAuthentication()) || !templateDetail.value) {
    return
  }

  // TODO: 实现二创逻辑
  // 需要设置 chat store 的相关状态
  // resetChatStore()
  // setChatTemplate(templateDetail.value)
  // if (templateDetail.value.coverUrl) {
  //   setAttachment({ name: '', url: templateDetail.value.coverUrl, contentType: '' })
  // }

  router.push('/chat')
}

// 直接下单
const handleProduction = async () => {
  if (!(await checkAuthentication()) || !templateDetail.value) {
    return
  }

  // TODO: 实现下单逻辑
  // 需要设置 produce store 的相关状态
  // setChatTemplate(templateDetail.value)
  // const firstOption = templateDetail.value?.processOptions?.[0]
  // setPrice(firstOption?.price || 0.01)
  // setDiscountedPrice(firstOption?.discountedPrice)
  // setProductImageUrl(templateDetail.value?.coverUrl || '')
  // setAssetId(null)

  router.push('/produce')
}

onMounted(() => {
  const id = route.query.id
  if (id) {
    fetchTemplateDetail(Number(id))
  }
})
</script>

<style scoped>
.template-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
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

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 80px;
}

/* 加载状态 */
.loading-container {
  width: 100%;
}

.loading-image {
  width: 100%;
  height: 725px;
  max-height: 46vh;
  background: #363636;
}

.loading-content {
  padding: 24px 16px;
}

.loading-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.skeleton-line {
  height: 24px;
  background: #444;
  border-radius: 4px;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-title {
  width: 40%;
}

.skeleton-price {
  width: 20%;
}

.skeleton-desc {
  width: 60%;
  margin-bottom: 16px;
}

.loading-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skeleton-tag {
  height: 20px;
  width: 80px;
  background: #444;
  border-radius: 12px;
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

/* 轮播容器 */
.swiper-container {
  position: relative;
  width: 100%;
  height: 725px;
  max-height: 46vh;
  background: #363636;
}

.swiper-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swiper-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.swiper-indicator {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 14px;
}

/* 模板信息 */
.template-info {
  padding: 24px 16px;
}

.info-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}

.template-name {
  font-size: 24px;
  font-weight: 500;
  color: #fff;
  flex: 1;
  word-break: break-all;
  white-space: pre-wrap;
  margin: 0;
}

.price-section {
  display: flex;
  align-items: baseline;
  flex-shrink: 0;
}

.price-symbol {
  font-size: 20px;
  font-weight: 500;
  color: #fccf4c;
}

.price-value {
  font-size: 40px;
  font-weight: 500;
  color: #fccf4c;
  margin-right: 8px;
}

.original-price {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: line-through;
}

.price-normal {
  font-size: 24px;
  color: #fff;
  font-weight: bold;
}

.template-description {
  font-size: 16px;
  font-weight: normal;
  color: #fff;
  margin: 16px 0;
  word-break: break-all;
  white-space: pre-wrap;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.tag-item {
  color: #fff;
  font-size: 13px;
  padding: 8px 16px;
  border: 1px solid #575757;
  border-radius: 24px;
  white-space: nowrap;
}

/* 底部按钮组 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 8px;
  padding: 8px 15px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.action-button {
  flex: 1;
}
</style>
