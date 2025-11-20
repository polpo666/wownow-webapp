<template>
  <div class="templates">
    <!-- Tab 导航栏 -->
    <div id="style-tabs-wrapper" class="style-tabs-wrapper">
      <div id="style-tabs" class="style-tabs" ref="tabsRef">
        <div
          v-for="item in promptStyles"
          :key="item.id"
          :id="`tab-${item.id}`"
          class="tab-item"
          :class="{ active: selectedStyle === item.id }"
          @click="onTabChange(item.id)"
        >
          <div class="tab-icon" :class="{ active: selectedStyle === item.id }">
            <img :src="item.thumbnail" :alt="item.name" />
          </div>
          <span class="tab-name" :class="{ active: selectedStyle === item.id }">
            {{ item.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tab 内容区 -->
    <div class="templates-content">
      <!-- 骨架屏 -->
      <div v-if="isTemplatesLoading" class="skeleton-grid">
        <div v-for="i in 12" :key="i" class="skeleton-item">
          <div class="skeleton-image"></div>
          <div class="skeleton-info">
            <div class="skeleton-line"></div>
            <div class="skeleton-tag"></div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="templates.length === 0" class="empty-state">
        <img src="@/assets/base/no-data.png" alt="empty" class="empty-image" />
        <p class="empty-text">暂无推荐内容</p>
      </div>

      <!-- 模板列表 -->
      <div v-else class="templates-grid">
        <div
          v-for="template in templates"
          :key="template.id"
          class="template-item"
          @click="goTemplateDetail(template.id)"
        >
          <div class="template-image-container">
            <img
              :src="template.coverUrl + '?x-oss-process=image/resize,p_50'"
              :alt="template.name"
              class="template-cover"
            />
          </div>
          <div class="template-info">
            <span class="template-name">{{ template.name }}</span>
            <span class="template-craft">{{ template.craftType }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getPromptStyles, getTemplates } from '@/api/template'
import type { WownowPromptStyle, WownowTemplate } from '@/types/template'
import { showFailToast } from 'vant'

// 移除 isTabsSticky prop，让 Tab 导航栏始终跟随滚动

const emit = defineEmits<{
  'tab-change': [event: { styleId: number; tabBarTop: number }]
}>()

const router = useRouter()

const promptStyles = ref<WownowPromptStyle[]>([])
const templates = ref<WownowTemplate[]>([])
const isTemplatesLoading = ref(false)
const selectedStyle = ref(0)
const tabsRef = ref<HTMLDivElement | null>(null)

// 初始化风格列表
const initPromptStyles = async () => {
  try {
    const response = await getPromptStyles({ pagination: false })
    if (response.code === 0 && response.data?.list) {
      promptStyles.value = response.data.list.filter(
        (style) => style.nameEn !== 'high_definition_magnification',
      )
      if (promptStyles.value.length > 0) {
        handleChangeStyleId(promptStyles.value[0].id)
      }
    } else {
      console.warn('Failed to fetch prompt styles:', response.message)
      showFailToast('获取风格列表失败')
    }
  } catch (error) {
    console.error(error)
    showFailToast('获取风格列表失败')
  }
}

// Tab 切换
const onTabChange = async (styleId: number) => {
  handleChangeStyleId(styleId)

  await nextTick()
  const tabsWrapper = document.getElementById('style-tabs-wrapper')
  if (tabsWrapper) {
    const tabBarTop = tabsWrapper.getBoundingClientRect().top
    emit('tab-change', { styleId, tabBarTop })
  }

  // 滚动到目标 tab 居中
  await nextTick()
  const tabElement = document.getElementById(`tab-${styleId}`)
  const tabsElement = document.getElementById('style-tabs')
  if (tabElement && tabsRef.value) {
    const tabRect = tabElement.getBoundingClientRect()
    const tabsRect = tabsRef.value.getBoundingClientRect()
    const scrollLeft = tabsRef.value.scrollLeft
    const tabCenter = tabRect.left - tabsRect.left + scrollLeft + tabRect.width / 2
    const newScrollLeft = tabCenter - tabsRect.width / 2
    if (tabsRef.value) {
      tabsRef.value.scrollTo({
        left: Math.max(0, newScrollLeft),
        behavior: 'smooth',
      })
    }
  }
}

// 切换风格 ID
const handleChangeStyleId = (styleId: number) => {
  selectedStyle.value = styleId
  getTemplatesByStyleId(styleId)
}

// 根据风格 ID 获取模板
const getTemplatesByStyleId = async (styleId: number) => {
  isTemplatesLoading.value = true
  try {
    const response = await getTemplates({
      pagination: false,
      styleId,
      status: 1,
      position: 'home_page',
    })
    if (response.code === 0 && response.data) {
      templates.value = response.data.list || []
    } else {
      console.warn('Failed to fetch templates by styleId:', response.message)
      showFailToast('获取模板列表失败')
    }
  } catch (error) {
    console.error(error)
    showFailToast('获取模板列表失败')
  } finally {
    isTemplatesLoading.value = false
  }
}

// 跳转到模板详情
const goTemplateDetail = (templateId: number) => {
  router.push(`/home/template?id=${templateId}`)
}

onMounted(() => {
  initPromptStyles()
})

defineExpose({
  initPromptStyles,
})
</script>

<style scoped>
.templates {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.style-tabs-wrapper {
  position: relative;
  width: 100%;
}

.style-tabs {
  display: flex;
  flex-direction: row;
  gap: 4px;
  padding: 12px 15px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.style-tabs::-webkit-scrollbar {
  display: none;
}

.tab-item {
  flex-shrink: 0;
  padding: 5px 16px 5px 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.55);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-item.active {
  background: rgba(252, 223, 76, 0.2);
  color: #fccf4c;
  border: 1px solid #fccf4c;
}

.tab-icon {
  width: 30px;
  height: 30px;
  position: relative;
}

.tab-icon.active {
  width: 40px;
  height: 40px;
  position: absolute;
  top: -4px;
  left: 4px;
}

.tab-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.tab-name {
  font-size: 12px;
  white-space: nowrap;
}

.tab-name.active {
  padding-left: 32px;
}

.templates-content {
  flex: 1;
  padding-top: 4px;
}

/* 骨架屏 */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 0 15px 15px;
}

.skeleton-item {
  background: #2b2b2b;
  border-radius: 16px;
  overflow: hidden;
}

.skeleton-image {
  aspect-ratio: 1;
  width: 100%;
  background: #1a1a1a;
  border-radius: 8px;
}

.skeleton-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}

.skeleton-line {
  height: 13px;
  background: #404040;
  border-radius: 4px;
  flex: 1;
  margin-right: 8px;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-tag {
  height: 20px;
  width: 32px;
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
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-image {
  width: 90px;
  height: 90px;
  margin-bottom: 6px;
}

.empty-text {
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
  text-align: center;
}

/* 模板列表 */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 0 15px 15px;
}

.template-item {
  background: #2b2b2b;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.template-item:active {
  transform: scale(0.95);
}

.template-image-container {
  aspect-ratio: 1;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.template-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}

.template-name {
  font-size: 13px;
  font-weight: 500;
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
</style>
