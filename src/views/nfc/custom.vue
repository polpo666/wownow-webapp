<template>
  <div class="nfc-custom-page">
    <div class="bg-cover"></div>
    <nav-bar title="创造展示页" :is-back="true" :default-back-behavior="false" @back="handleBack" />

    <div class="content-wrapper">
      <!-- 卡片容器 -->
      <div class="card-container">
        <div class="card-shadow card-shadow-top"></div>
        <div class="card-shadow card-shadow-bottom"></div>
        <div class="nfc-card">
          <!-- 文本输入区域 -->
          <van-field
            v-model="textValue"
            type="textarea"
            rows="6"
            placeholder="说点什么展示"
            maxlength="1024"
            class="text-input"
          />

          <!-- 媒体文件区域 -->
          <div v-if="mediaType === 'image'" class="media-section">
            <div class="image-grid">
              <div v-for="(attachment, index) in attachments" :key="index" class="image-item">
                <img :src="attachment.url" alt="image" class="image-preview" />
                <div class="image-delete" @click="handleDelete(attachment.url)">×</div>
              </div>
              <div
                v-if="attachments.length < 5"
                class="image-item upload-item"
                @click="onShowActionSheet"
              >
                <van-icon name="plus" size="24" color="#fff" />
              </div>
            </div>
          </div>

          <div v-else-if="mediaType === 'video'" class="media-section">
            <div class="video-preview">
              <video :src="attachments[0].url" controls class="video-player"></video>
              <div class="video-delete" @click="handleDelete(attachments[0].url)">×</div>
            </div>
          </div>

          <div v-else class="media-section">
            <div v-if="uploadQueue.length > 0" class="upload-queue">
              <div v-for="(item, index) in uploadQueue" :key="index" class="upload-item uploading">
                <van-loading type="spinner" color="#fff" />
              </div>
            </div>
            <div v-else class="upload-placeholder" @click="onShowActionSheet">
              <van-icon name="plus" size="48" color="#fff" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-actions">
      <van-button
        block
        type="primary"
        color="#FADA39"
        :disabled="disabled"
        :class="{ disabled: disabled }"
        @click="handleComplete"
      >
        完成
      </van-button>
    </div>

    <!-- 选择媒体类型 -->
    <van-action-sheet
      :show="showActionSheet"
      :actions="actions"
      cancel-text="取消"
      @select="onSelect"
      @cancel="onClose"
      @update:show="(val) => (showActionSheet = val)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProduceStore } from '@/stores/produce'
import { ossUploadPresign, uploadToOSS, type Attachment } from '@/api/upload'
import { MIME_TYPE_MAP } from '@/lib/constants'
import { showFailToast, showConfirmDialog, showLoadingToast, closeToast } from 'vant'
import NavBar from '@/components/nav-bar.vue'

const router = useRouter()
const produceStore = useProduceStore()

const textValue = ref('')
const attachments = ref<Attachment[]>([])
const uploadQueue = ref<string[]>([])
const showActionSheet = ref(false)

const actions = [
  { id: 1, name: '上传图片', subname: '从相册选择' },
  { id: 2, name: '上传视频', subname: '从相册选择' },
]

const disabled = computed(() => attachments.value.length === 0)

const mediaType = computed(() => {
  return attachments.value.length > 0 ? attachments.value[0].contentType.split('/')[0] : ''
})

const remainingImageCount = computed(() => {
  return Math.max(0, 5 - attachments.value.length - uploadQueue.value.length)
})

// 从 store 中恢复内容
onMounted(() => {
  if (produceStore.nfcContent && produceStore.nfcContent.type === 'custom') {
    textValue.value = produceStore.nfcContent.text || ''
    attachments.value = produceStore.nfcContent.attachments || []
  }
})

const onShowActionSheet = () => {
  showActionSheet.value = true
}

const onClose = () => {
  showActionSheet.value = false
}

const onSelect = (action: { id: number }) => {
  if (action.id === 1) {
    handleSelectMedia('image', remainingImageCount.value)
  } else if (action.id === 2) {
    handleSelectMedia('video', 1)
  }
  showActionSheet.value = false
}

const handleSelectMedia = (mediaType: 'image' | 'video', count: number = 1) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = mediaType === 'image' ? 'image/*' : 'video/*'
  input.multiple = mediaType === 'image' && count > 1

  input.onchange = async (e) => {
    const files = (e.target as HTMLInputElement).files
    if (!files || files.length === 0) return

    const maxSize = 50 * 1024 * 1024 // 50MB
    const selectedFiles: File[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > maxSize) {
        showFailToast('文件大小应小于 50MB')
        continue
      }
      selectedFiles.push(file)
    }

    if (selectedFiles.length === 0) return

    await handleFileChange(selectedFiles)
  }

  input.click()
}

const handleBack = async () => {
  const originalText = produceStore.nfcContent?.text || ''
  const currentAttachments = JSON.stringify(attachments.value)
  const originalAttachments = JSON.stringify(produceStore.nfcContent?.attachments || [])

  if (textValue.value.trim() !== originalText || currentAttachments !== originalAttachments) {
    try {
      await showConfirmDialog({
        title: '提示',
        message: '当前内容未保存，确认返回？',
      })
      router.back()
    } catch {
      // 用户取消
    }
  } else {
    router.back()
  }
}

const handleFileChange = async (files: File[]) => {
  const isImage = files[0].type.startsWith('image/')
  if (isImage) {
    if (attachments.value.length >= 5) {
      showFailToast('最多支持上传5张图片')
      return
    }
    uploadQueue.value = files.map((file) => file.name)
  } else {
    attachments.value = []
    uploadQueue.value = [files[0].name]
  }

  try {
    showLoadingToast({
      message: '上传中...',
      forbidClick: true,
    })

    const uploadPromises = files.map((file) => uploadFile(file))
    const uploadedAttachments = await Promise.all(uploadPromises)
    const successfullyUploadedAttachments = uploadedAttachments.filter(
      (attachment) => attachment !== null,
    ) as Attachment[]

    attachments.value = isImage
      ? [...attachments.value, ...successfullyUploadedAttachments]
      : successfullyUploadedAttachments
  } catch (error) {
    console.error('Error uploading files!', error)
    const errorMessage = error instanceof Error ? error.message : '上传失败，请重试'
    showFailToast(errorMessage)
  } finally {
    uploadQueue.value = []
    closeToast()
  }
}

const uploadFile = async (file: File): Promise<Attachment | null> => {
  const filename = file.name || `file-${Date.now()}`
  const contentType = file.type || 'image/jpeg'
  const size = file.size

  try {
    // 获取预签名URL
    const presignResponse = await ossUploadPresign({
      filename,
      contentType,
      size,
    })

    if (presignResponse.code !== 0 || !presignResponse.data) {
      throw new Error(presignResponse.message || '获取OSS上传凭证失败')
    }

    const { uploadUrl, publicUrl, originalFilename } = presignResponse.data

    // 上传文件到OSS
    await uploadToOSS(file, uploadUrl, contentType)

    return {
      url: publicUrl,
      name: originalFilename,
      contentType: contentType,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '上传失败'
    throw new Error(errorMessage)
  }
}

const handleDelete = (url: string) => {
  attachments.value = attachments.value.filter((att) => att.url !== url)
}

const handleComplete = () => {
  if (attachments.value.length === 0) {
    showFailToast('请至少上传一张图片或一个视频')
    return
  }
  if (uploadQueue.value.length > 0) {
    showFailToast('请等待文件上传完成')
    return
  }

  // 保存内容到 store
  produceStore.setNfcContent({
    type: 'custom',
    link: '',
    text: textValue.value.trim(),
    attachments: attachments.value,
  })

  router.back()
}
</script>

<style scoped>
.nfc-custom-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
  color: #fff;
}

.bg-cover {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/bg-chat.png');
  background-size: cover;
  background-position: center;
  z-index: -1;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 15px;
}

.card-container {
  width: 100%;
  position: relative;
  z-index: 1;
}

.card-shadow {
  position: absolute;
  width: 87%;
  height: 225px;
  background: #3f3f3f;
  border-radius: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: -1;
}

.card-shadow-top {
  top: -0.5px;
  transform: translateX(-50%) rotate(5deg);
}

.card-shadow-bottom {
  bottom: -1.5px;
  transform: translateX(-50%) rotate(-5deg);
}

.nfc-card {
  min-height: 500px;
  background: #4634df;
  background-image: url('@/assets/bg-nfc.png');
  background-size: contain;
  background-position: top right;
  background-repeat: no-repeat;
  border-radius: 24px;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.text-input {
  width: 100%;
  background: transparent;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.text-input :deep(.van-field__control) {
  color: #fff;
}

.text-input :deep(.van-field__control::placeholder) {
  color: rgba(255, 255, 255, 0.55);
}

.media-section {
  width: 100%;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
}

.upload-item {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px dashed rgba(255, 255, 255, 0.3);
}

.upload-item.uploading {
  border: none;
}

.video-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}

.upload-placeholder {
  width: 60vw;
  aspect-ratio: 1;
  margin: 0 auto;
  padding-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
}

.upload-queue {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.bottom-actions {
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.bottom-actions :deep(.van-button) {
  border-radius: 16px;
}

.bottom-actions :deep(.van-button--disabled) {
  background: #7a7a7a !important;
  border-color: #7a7a7a !important;
  color: #a6a6a6 !important;
  opacity: 1;
}
</style>
