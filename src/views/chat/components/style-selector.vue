<template>
  <div class="style-selector-container">
    <!-- 风格按钮 -->
    <div ref="buttonRef" class="style-button" :class="{ disabled: noStyle }" @click="toggle">
      <img
        src="@/assets/style.png"
        alt="style"
        class="style-icon"
        :style="{ opacity: noStyle ? 0.5 : 1 }"
      />
      <span :style="{ color: noStyle ? '#999999' : '#ffffff' }">风格</span>
    </div>

    <!-- 风格选择器弹窗 -->
    <van-popup
      :show="show"
      position="bottom"
      :close-on-click-overlay="true"
      class="style-popup"
      :z-index="1000"
      @close="closeStyleSelector"
    >
      <div class="style-container" :style="containerStyle">
        <div class="style-scroll" ref="scrollRef">
          <div
            v-for="style in filteredStyles"
            :key="style.id"
            ßß
            class="style-item-wrapper"
            @click="handleStyleClick(style)"
          >
            <div class="style-item">
              <img v-if="style.imageUrl" :src="style.imageUrl" alt="style" class="style-image" />
              <div v-else class="style-placeholder">
                <img
                  src="@/assets/svgs/image-placeholder.svg"
                  alt="placeholder"
                  class="placeholder-image"
                />
              </div>
              <div class="style-name-container">
                <span class="style-name-text">{{ style.name }}</span>
              </div>
            </div>
          </div>
          <!-- 占位元素，确保最后一个元素有足够的滚动空间 -->
          <div class="style-placeholder-end" />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { getPromptStyles } from '@/api/template'
import { useChatStore } from '@/stores/chat'
import type { WownowPromptStyle } from '@/types/template'
import { showFailToast } from 'vant'

interface Props {
  onStyleChange?: (style: WownowPromptStyle) => void
}

const props = defineProps<Props>()

const chatStore = useChatStore()
const show = ref(false)
const noStyle = ref(false)
const filteredStyles = ref<WownowPromptStyle[]>([])
const promptStyles = ref<WownowPromptStyle[]>([])
const buttonRef = ref<HTMLDivElement | null>(null)
const scrollRef = ref<HTMLDivElement | null>(null)
const containerStyle = ref<Record<string, string>>({})

// 获取风格列表
const loadPromptStyles = async () => {
  try {
    const response = await getPromptStyles({ pagination: false })
    if (response.code === 0 && response.data?.list) {
      promptStyles.value = response.data.list.filter(
        (style) => style.nameEn !== 'high_definition_magnification',
      )
    } else {
      console.warn('Failed to fetch prompt styles:', response.message)
      showFailToast('获取风格列表失败')
    }
  } catch (error) {
    console.error(error)
    showFailToast('获取风格列表失败')
  }
}

// 根据模板过滤风格
const filterStyles = () => {
  const template = chatStore.chatTemplate

  if (!template || !promptStyles.value.length) {
    filteredStyles.value = []
    return
  }

  const { craftType, name, styleId } = template

  // 如果模板已经有指定的风格ID，找到并设置该风格
  if (styleId) {
    const selectedStyle = promptStyles.value.find((s) => s.id === styleId)
    if (selectedStyle) {
      chatStore.setPromptStyle(selectedStyle)
      props.onStyleChange?.(selectedStyle)
    }
    filteredStyles.value = promptStyles.value
    return
  }

  // 圆形纪念币 + 平雕 = 禁用风格选择
  if (name === '圆形纪念币' && craftType?.includes('平雕')) {
    noStyle.value = true
    filteredStyles.value = []
    return
  }

  // 如果是平雕工艺，过滤适合的风格
  if (craftType?.includes('平雕')) {
    filteredStyles.value = promptStyles.value

    // 设置默认风格为矢量线条风格 (ID: 1330)
    const defaultStyle = promptStyles.value.find((style) => style.id === 1330)
    if (defaultStyle) {
      chatStore.setPromptStyle(defaultStyle)
    }
  } else {
    filteredStyles.value = promptStyles.value
  }

  noStyle.value = false
}

// 监听模板变化
watch(
  () => chatStore.chatTemplate,
  () => {
    filterStyles()
  },
  { immediate: true },
)

// 监听风格列表变化
watch(
  () => promptStyles.value,
  () => {
    filterStyles()
  },
)

const toggle = async () => {
  if (noStyle.value) return

  // 计算按钮位置，设置容器样式
  if (buttonRef.value) {
    const rect = buttonRef.value.getBoundingClientRect()
    const windowHeight = window.innerHeight

    // 如果按钮在屏幕上半部分，显示在按钮上方
    if (rect.top < windowHeight / 2) {
      containerStyle.value = {
        position: 'absolute',
        top: `${rect.top - 150}px`,
        left: '0',
        right: '0',
      }
    } else {
      // 否则显示在底部
      containerStyle.value = {
        position: 'absolute',
        bottom: '80px',
        left: '0',
        right: '0',
      }
    }
  }

  show.value = !show.value
}

const closeStyleSelector = () => {
  show.value = false
}

const handleStyleClick = (style: WownowPromptStyle) => {
  chatStore.setPromptStyle(style)
  props.onStyleChange?.(style)
  closeStyleSelector()
}

onMounted(() => {
  loadPromptStyles()
})
</script>

<style scoped>
.style-selector-container {
  position: relative;
}

.style-button {
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 6px;
  gap: 6px;
  border: 1px solid #575757;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-start;
}

.style-button:not(.disabled):hover {
  background: rgba(255, 255, 255, 0.1);
}

.style-button.disabled {
  border-color: #333333;
  cursor: not-allowed;
}

.style-icon {
  width: 18px;
  height: 18px;
}

.style-popup :deep(.van-popup) {
  background: transparent;
}

.style-container {
  background: #0d0d0d;
  padding: 6px 8px;
  border-radius: 0;
}

.style-scroll {
  display: flex;
  flex-direction: row;
  gap: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  padding-right: 8px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.style-scroll::-webkit-scrollbar {
  display: none;
}

.style-item-wrapper {
  width: 90px;
  height: 130px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.2s;
}

.style-item-wrapper:hover {
  transform: scale(1.05);
}

.style-item {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    rgba(42, 45, 54, 1) 0%,
    rgba(42, 48, 53, 0.8) 20%,
    rgba(19, 22, 21, 1) 40%,
    rgba(74, 84, 67, 1) 60%,
    rgba(102, 61, 62, 1) 83%,
    rgba(52, 45, 63, 1) 100%
  );
}

.style-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-width: 90px;
  min-height: 130px;
  background: #1a1a1a;
}

.style-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #1a1a1a;
}

.placeholder-image {
  width: 40px;
  height: 40px;
  opacity: 0.5;
}

.style-name-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.style-name-text {
  color: white;
  font-size: 12px;
  font-weight: 600;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.style-placeholder-end {
  width: 80px;
  flex-shrink: 0;
}
</style>
