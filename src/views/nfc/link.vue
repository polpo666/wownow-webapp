<template>
  <div class="nfc-link-page">
    <div class="bg-cover"></div>
    <nav-bar title="链接跳转" :is-back="true" :default-back-behavior="false" @back="handleBack" />

    <div class="content-wrapper">
      <div class="input-section">
        <van-field
          v-model="inputVal"
          type="textarea"
          rows="6"
          placeholder="点击输入链接内容"
          maxlength="512"
          class="link-input"
          @input="handleInputChange"
        />
      </div>
    </div>

    <div class="bottom-actions">
      <van-button
        block
        type="primary"
        color="#FADA39"
        :disabled="isEmpty"
        :class="{ disabled: isEmpty }"
        @click="handleComplete"
      >
        完成
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProduceStore } from '@/stores/produce'
import { extractLink } from '@/utils/url'
import { showFailToast, showConfirmDialog } from 'vant'
import NavBar from '@/components/nav-bar.vue'

const router = useRouter()
const produceStore = useProduceStore()

const inputVal = ref('')
const isEmpty = ref(true)
const recognizedLink = ref('')

// 从 store 中恢复链接内容
onMounted(() => {
  if (
    produceStore.nfcContent &&
    produceStore.nfcContent.type === 'link' &&
    produceStore.nfcContent.link
  ) {
    inputVal.value = produceStore.nfcContent.link
    recognizedLink.value = produceStore.nfcContent.link
    isEmpty.value = produceStore.nfcContent.link.trim() === ''
  }
})

const handleInputChange = (value: string) => {
  const link = extractLink(value) || ''
  inputVal.value = value
  recognizedLink.value = link
  isEmpty.value = link === ''
}

const handleBack = async () => {
  const currentLink = (recognizedLink.value || '').trim()
  const storedLink = (produceStore.nfcContent?.link || '').trim()

  if (currentLink !== storedLink) {
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

const handleComplete = () => {
  const sanitizedLink = (recognizedLink.value || '').trim()
  if (!sanitizedLink) {
    showFailToast('未识别到有效链接')
    return
  }

  // 保存链接内容到 store
  produceStore.setNfcContent({
    type: 'link',
    link: sanitizedLink,
    text: '',
    attachments: [],
  })

  router.back()
}
</script>

<style scoped>
.nfc-link-page {
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
  padding: 16px;
  overflow-y: auto;
}

.input-section {
  flex: 1;
}

.link-input {
  width: 100%;
  border: 1px solid #3e3851;
  border-radius: 12px;
  padding: 12px 15px;
  background: transparent;
  color: #fff;
  font-size: 14px;
}

.link-input :deep(.van-field__control) {
  color: #fff;
}

.link-input :deep(.van-field__control::placeholder) {
  color: rgba(255, 255, 255, 0.55);
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
