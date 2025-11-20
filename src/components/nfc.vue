<template>
  <div class="nfc-component">
    <div class="nfc-header">
      <div class="nfc-title">
        <span>NFC</span>
        <img src="@/assets/produce/nfc.png" class="nfc-icon" alt="nfc" />
      </div>
      <div v-if="nfcContent && edit" class="nfc-actions">
        <span class="action-edit" @click="onAddNfc">修改</span>
        <span class="action-delete" @click="handleShowDeletePopup">删除</span>
      </div>
    </div>

    <div class="nfc-content">
      <!-- 已有 NFC 内容 -->
      <div v-if="nfcContent">
        <!-- 链接跳转 -->
        <div v-if="nfcContent.type === 'link'" class="nfc-card nfc-link">
          <div class="nfc-link-text">{{ nfcContent.link }}</div>
          <img src="@/assets/svgs/icon-nfc-link.svg" class="nfc-link-icon" alt="link" />
        </div>

        <!-- 创意展示页 -->
        <div v-else-if="nfcContent.type === 'custom'" class="nfc-card nfc-custom">
          <div class="nfc-custom-text">
            <div v-if="nfcContent.text" class="text-content">{{ nfcContent.text }}</div>
            <div v-else class="text-placeholder">{{ defaultNfcTitle }}</div>
          </div>
          <img
            v-if="mediaType === 'image' && nfcContent.attachments[0]"
            :src="nfcContent.attachments[0].url"
            class="nfc-media-thumb"
            alt="media"
          />
          <img
            v-else-if="mediaType === 'video'"
            src="@/assets/video.png"
            class="nfc-media-thumb"
            alt="video"
          />
          <img
            v-else-if="mediaType === 'audio'"
            src="@/assets/audio.png"
            class="nfc-media-thumb"
            alt="audio"
          />
        </div>

        <!-- 专属聊天助理 -->
        <div v-else-if="nfcContent.type === 'agent'" class="nfc-card nfc-agent">
          <div class="nfc-agent-info">
            <div class="agent-name">{{ nfcContent.agent?.name }}</div>
            <div class="agent-description">{{ nfcContent.agent?.description }}</div>
          </div>
          <img
            v-if="nfcContent.agent?.coverUrl && !nfcContent.agent.coverUrlError"
            :src="nfcContent.agent?.coverUrl"
            class="nfc-agent-cover"
            alt="agent"
          />
          <div v-else class="nfc-agent-placeholder">
            <img
              src="@/assets/svgs/icon-nfc-agent.svg"
              class="agent-placeholder-icon"
              alt="agent"
            />
          </div>
        </div>
      </div>

      <!-- 新增 NFC -->
      <van-button v-else plain type="primary" class="add-nfc-button" @click="onAddNfc">
        <div class="add-nfc-content">
          <span class="add-nfc-text">新增NFC</span>
          <van-icon name="add-o" color="#ffffff" size="24" />
        </div>
      </van-button>
    </div>

    <!-- 选择 NFC 类型 -->
    <van-action-sheet
      :show="showActionSheet"
      :actions="actions"
      cancel-text="取消"
      @select="onSelect"
      @cancel="onClose"
      @update:show="(val) => (showActionSheet = val)"
    />

    <!-- 删除确认弹窗 -->
    <van-dialog
      :show="showDeletePopup"
      title='删除"NFC"内容？'
      message="删除后将从该产品中移除，你可在下单前随时重新添加。"
      show-cancel-button
      cancel-button-text="取消"
      confirm-button-text="删除"
      confirm-button-color="#FF4040"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
      @update:show="(val) => (showDeletePopup = val)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProduceStore } from '@/stores/produce'

interface Props {
  edit?: boolean
}

withDefaults(defineProps<Props>(), {
  edit: true,
})

const router = useRouter()
const produceStore = useProduceStore()

const showActionSheet = ref(false)
const showDeletePopup = ref(false)

const actions = [
  {
    name: '链接跳转',
    type: 'link',
    subname: '将NFC指向您指定的任意网址、社交媒体主页',
  },
  {
    name: '创意展示页',
    type: 'custom',
    subname: '轻松上传图文、视频等内容，即可生成一个专属页面供NFC读取',
  },
  {
    name: '专属聊天助理',
    type: 'agent',
    subname: '将NFC指向特定AI聊天助理',
  },
]

const nfcContent = computed(() => produceStore.nfcContent)

const mediaType = computed(() => {
  if (
    nfcContent.value &&
    nfcContent.value.type === 'custom' &&
    nfcContent.value.attachments.length > 0 &&
    nfcContent.value.attachments[0]
  ) {
    return nfcContent.value.attachments[0].contentType.split('/')[0]
  }
  return ''
})

const defaultNfcTitle = computed(() => {
  return `WOWNOW (${new Date().toISOString().split('T')[0]})`
})

const onAddNfc = () => {
  showActionSheet.value = true
}

const onClose = () => {
  showActionSheet.value = false
}

const onSelect = (action: { type: string }) => {
  const type = action.type
  if (type === 'link') {
    router.push('/nfc/link')
  } else if (type === 'custom') {
    router.push('/nfc/custom')
  } else if (type === 'agent') {
    router.push('/nfc/agent')
  }
  showActionSheet.value = false
}

const handleShowDeletePopup = () => {
  showDeletePopup.value = true
}

const cancelDelete = () => {
  showDeletePopup.value = false
}

const confirmDelete = () => {
  produceStore.clearNfc()
  showDeletePopup.value = false
}
</script>

<style scoped>
.nfc-component {
  padding: 12px;
}

.nfc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.nfc-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: #cccccc;
}

.nfc-icon {
  width: 16px;
  height: 16px;
}

.nfc-actions {
  display: flex;
  gap: 16px;
}

.action-edit {
  font-size: 14px;
  color: #fff;
  cursor: pointer;
}

.action-delete {
  font-size: 14px;
  color: #e63232;
  cursor: pointer;
}

.nfc-content {
  width: 100%;
}

.nfc-card {
  background: #232323;
  border-radius: 12px;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

/* 链接跳转 */
.nfc-link {
  align-items: center;
}

.nfc-link-text {
  font-size: 14px;
  color: #fff;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nfc-link-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

/* 创意展示页 */
.nfc-custom {
  align-items: flex-start;
}

.nfc-custom-text {
  flex: 1;
  flex-shrink: 0;
}

.text-content {
  font-size: 14px;
  color: #fff;
  line-height: 20px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.text-placeholder {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
  height: 40px;
  line-height: 20px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.nfc-media-thumb {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  object-fit: cover;
  flex-shrink: 0;
}

/* 专属聊天助理 */
.nfc-agent {
  align-items: flex-start;
}

.nfc-agent-info {
  flex: 1;
  flex-shrink: 0;
}

.agent-name {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-bottom: 4px;
}

.agent-description {
  font-size: 14px;
  color: #fff;
  line-height: 20px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.nfc-agent-cover {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  object-fit: cover;
  flex-shrink: 0;
}

.nfc-agent-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.agent-placeholder-icon {
  width: 60%;
  height: 60%;
  opacity: 0.8;
}

/* 新增 NFC 按钮 */
.add-nfc-button {
  width: 100%;
  height: 64px;
  background: rgba(0, 0, 0, 0.2) !important;
  border: 1px solid #fff !important;
  border-radius: 16px !important;
  padding: 0 15px;
}

.add-nfc-button :deep(.van-button__text) {
  width: 100%;
}

.add-nfc-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.add-nfc-text {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
}
</style>
