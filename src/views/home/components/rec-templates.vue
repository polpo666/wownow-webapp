<template>
  <div class="rec-templates">
    <div class="swiper-wrapper" :class="{ 'has-banner': hasBanner }">
      <van-swipe
        v-model="currentIndex"
        :autoplay="autoplay ? 3000 : 0"
        :loop="true"
        :touchable="true"
        :show-indicators="false"
        class="template-swiper"
        :class="{ 'has-banner': hasBanner }"
        @change="onSwiperChange"
      >
        <van-swipe-item
          v-for="(template, index) in recTemplates"
          :key="template.id"
          class="swiper-item"
        >
          <div
            :id="index === currentIndex ? 'rec-templates-active' : 'rec-templates'"
            class="template-card"
            :class="{ active: index === currentIndex }"
            @click="goTemplateDetail(template.id)"
          >
            <div class="template-image-wrapper">
              <img
                v-if="template.threeDimensionUrls.length > 0"
                :src="template.threeDimensionUrls[0] + '?x-oss-process=image/resize,p_50'"
                :alt="template.name"
                class="template-image"
                :style="getImageStyle(index)"
              />
              <img
                v-else-if="template.recommendCoverUrl"
                :src="template.recommendCoverUrl"
                :alt="template.name"
                class="template-image"
              />
              <img
                v-else-if="template.coverUrl"
                :src="template.coverUrl"
                :alt="template.name"
                class="template-image cover"
              />
            </div>
            <div class="template-footer" :class="{ 'has-banner': hasBanner }">
              <span class="template-name">{{ template.name }}</span>
              <span class="template-craft">{{ template.craftType }}</span>
            </div>
          </div>
        </van-swipe-item>
      </van-swipe>

      <div class="hint-text" :class="{ 'has-banner': hasBanner }">
        <span>点击灵感开始创作</span>
        <img src="@/assets/click.gif" alt="click" class="click-icon" />
      </div>
    </div>

    <div id="start-create" class="create-button" @click="onCreate">
      <img src="@/assets/home/create-btn.png" alt="create" class="create-btn-image" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getTemplates } from '@/api/template'
import type { WownowTemplate } from '@/types/template'
import { TemplateLabel } from '@/types/template'
import { showFailToast } from 'vant'

const props = defineProps<{
  hasBanner?: boolean
}>()

const router = useRouter()
const authStore = useAuthStore()

const recTemplates = ref<WownowTemplate[]>([])
const isLoading = ref(false)
const currentIndex = ref(0)
const autoplay = ref(true)

const rectLabels = new Set([
  TemplateLabel.FlatCard,
  TemplateLabel.ReliefCard,
  TemplateLabel.NormalCard,
  TemplateLabel.RedEnvelopeCard,
])

const leftOffset = computed(() => {
  const activeItem = recTemplates.value?.[currentIndex.value]
  return activeItem && rectLabels.has(activeItem.label) ? 0 : props.hasBanner ? -20 : -30
})

const topOffset = computed(() => {
  return props.hasBanner ? -6 : -10
})

const activeScale = computed(() => {
  return props.hasBanner ? 1.13 : 1.1
})

const getImageStyle = (index: number) => {
  if (index === currentIndex.value) {
    return {
      transform: `scale(${activeScale.value}) translate(${leftOffset.value}px, ${topOffset.value}px)`,
    }
  }
  return {}
}

// 刷新数据
const refresh = async () => {
  currentIndex.value = 0
  await fetchRecTemplates()
}

// 获取推荐模板
const fetchRecTemplates = async () => {
  isLoading.value = true
  try {
    const response = await getTemplates({
      pagination: false,
      isRecommended: 1,
      status: 1,
      position: 'home_page',
    })
    if (response.code === 0 && response.data) {
      recTemplates.value = response.data.list || []
    } else {
      console.warn('Failed to fetch recommended templates:', response.message)
      showFailToast('加载失败')
    }
  } catch (error) {
    console.error(error)
    showFailToast('加载失败')
  } finally {
    isLoading.value = false
  }
}

// Swiper 切换
const onSwiperChange = (index: number) => {
  currentIndex.value = index
}

// 跳转到模板详情
const goTemplateDetail = (templateId: number) => {
  router.push(`/home/template?id=${templateId}`)
}

// 创建作品
const onCreate = () => {
  if (!authStore.isLoggedIn) {
    authStore.setShowLoginModal(true)
  } else {
    router.push('/create')
  }
}

onMounted(() => {
  fetchRecTemplates()
})

defineExpose({
  refresh,
})
</script>

<style scoped>
.rec-templates {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

.swiper-wrapper {
  position: relative;
}

.swiper-wrapper:not(.has-banner) {
  padding-top: 8vw;
  z-index: 10;
}

.template-swiper {
  width: 100%;
  overflow: visible;
}

.template-swiper.has-banner {
  height: 220px;
  padding: 0 100px;
  margin: 0 -100px;
}

.template-swiper:not(.has-banner) {
  height: 80vw;
  padding: 0 70px;
  margin: 0 -70px;
}

.swiper-item {
  padding-top: 16px;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.template-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  transition: all 0.3s ease;
  position: relative;
  background: #2a2a2a;
  transform: scale(0.85);
  cursor: pointer;
}

.template-card.active {
  background: #4634df;
  transform: scale(1);
}

.template-image-wrapper {
  flex: 1;
  width: 100%;
  transition: all 0.3s ease-in-out;
}

.template-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.template-image.cover {
  object-fit: cover;
  border-radius: 4px;
  overflow: hidden;
}

.template-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 26px 12px;
}

.template-footer.has-banner {
  padding: 8px 12px 12px;
}

.template-name {
  font-size: 13px;
  color: #fff;
}

.template-craft {
  white-space: nowrap;
  font-size: 12px;
  color: #fff;
  border: 1px solid #fff;
  border-radius: 8px;
  padding: 2px 6px;
}

.hint-text {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  gap: 8px;
}

.hint-text.has-banner {
  padding-top: 8px;
}

.hint-text:not(.has-banner) {
  padding-top: 16px;
}

.click-icon {
  width: 28px;
  height: 24px;
}

.create-button {
  padding: 24px 15px 15px;
  cursor: pointer;
}

.create-btn-image {
  width: 100%;
  height: auto;
}

:deep(.van-swipe) {
  height: 100%;
}

:deep(.van-swipe-item) {
  height: 100%;
}
</style>
