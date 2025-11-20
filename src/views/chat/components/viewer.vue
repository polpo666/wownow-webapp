<template>
  <van-popup
    :show="props.show"
    :close-on-click-overlay="false"
    class="viewer-popup"
    :z-index="99999"
    @update:show="handleShowUpdate"
    @close="onClose"
  >
    <div class="viewer-container">
      <nav-bar title="" :is-back="true" :default-back-behavior="false" @back="onBack" />

      <!-- 图片列表 -->
      <div class="image-list">
        <div
          v-for="item in outputImages"
          :key="item.id || item.imageUrl || Math.random()"
          class="image-item"
          :class="{ selected: item.imageUrl === currentImageUrl }"
          @click="handleImageClick(item)"
        >
          <van-icon
            v-if="item.imageUrl === currentImageUrl"
            name="checked"
            size="20"
            class="check-icon"
            color="#FADA39"
          />
          <img :src="item.imageUrl" alt="output" class="image-thumb" />
        </div>
      </div>

      <!-- 主图预览 -->
      <div class="main-preview">
        <img :src="currentImageUrl" alt="preview" class="preview-image" />
        <div class="ai-tag">图片由AI生成</div>
      </div>

      <!-- 底部按钮 -->
      <div class="bottom-actions">
        <van-button block class="back-button" @click="onBack">返回</van-button>
        <van-button
          block
          type="primary"
          color="#FADA39"
          class="produce-button"
          @click="handleProduction"
        >
          绑定终端生产
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useProduceStore } from '@/stores/produce'
import NavBar from '@/components/nav-bar.vue'

interface Props {
  src?: string
  show?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  show: false,
})

const emit = defineEmits<{
  back: []
}>()

const router = useRouter()
const chatStore = useChatStore()
const produceStore = useProduceStore()

const currentImageUrl = ref('')

const outputImages = computed(() => {
  return chatStore.outputList.filter((item) => item.imageUrl)
})

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      currentImageUrl.value =
        props.src || outputImages.value.find((item) => item.imageUrl)?.imageUrl || ''
    }
  },
)

const handleImageClick = (item: { imageUrl: string }) => {
  currentImageUrl.value = item.imageUrl
}

const handleShowUpdate = (value: boolean) => {
  if (!value) {
    emit('back')
  }
}

const onBack = () => {
  emit('back')
}

const onClose = () => {
  emit('back')
}

const handleProduction = () => {
  produceStore.setAssetId(null)
  produceStore.setProductImageUrl(currentImageUrl.value)
  router.push('/produce')
}
</script>

<style scoped>
.viewer-popup {
  background: #000;
}

.viewer-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: #000;
  color: #fff;
}

.image-list {
  display: flex;
  gap: 8px;
  padding: 8px;
  overflow-x: auto;
  flex-wrap: nowrap;
}

.image-item {
  position: relative;
  width: 105px;
  height: 105px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
}

.image-item.selected {
  border: 2px solid #fada39;
}

.check-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1;
}

.image-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.main-preview {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ai-tag {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.bottom-actions {
  display: flex;
  gap: 8px;
  padding: 16px;
}

.back-button {
  width: 200px;
  flex-shrink: 0;
  background: #232323;
  border-color: #232323;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  border-radius: 16px;
}

.produce-button {
  flex: 1;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
}

.produce-button :deep(.van-button) {
  background: #fada39;
  border-color: #fada39;
  color: #000;
}
</style>
