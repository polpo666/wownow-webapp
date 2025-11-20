<template>
  <div>
    <div
      id="category-popup"
      class="category-button"
      :class="{ disabled: disabled }"
      @click="handlePress"
    >
      <img
        src="@/assets/category.png"
        alt="category"
        class="category-icon"
        :style="{ opacity: disabled ? 0.5 : 1 }"
      />
      <span :style="{ color: disabled ? '#999999' : '#ffffff' }">切换品类</span>
    </div>

    <van-popup
      v-model:show="showModal"
      round
      position="center"
      class="category-popup"
      :z-index="99999"
      @close="handleCancel"
    >
      <div class="popup-content">
        <div class="popup-title">切换品类提醒</div>
        <div class="popup-message">切换品类后会清空当前对话里的所有图片，是否继续？</div>
        <div class="popup-actions">
          <van-button class="cancel-button" @click="handleCancel">取消</van-button>
          <van-button class="confirm-button" @click="handleContinue">继续</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'

interface Props {
  disabled?: boolean
  selectedName?: string
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  selectedName: undefined,
})

const router = useRouter()
const chatStore = useChatStore()

const showModal = ref(false)

const handlePress = () => {
  if (disabled) return
  showModal.value = true
}

const handleCancel = () => {
  showModal.value = false
}

const handleContinue = () => {
  showModal.value = false
  chatStore.resetChatStore()
  router.replace('/create/category')
}
</script>

<style scoped>
.category-button {
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 6px;
  gap: 8px;
  border: 1px solid #575757;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-start;
}

.category-button:not(.disabled):hover {
  background: rgba(255, 255, 255, 0.1);
}

.category-button.disabled {
  border-color: #333333;
  cursor: not-allowed;
}

.category-icon {
  width: 12px;
  height: 12px;
}

.category-popup :deep(.van-popup) {
  background: transparent;
}

.popup-content {
  position: relative;
  width: 311px;
  min-height: 203px;
  border-radius: 26px;
  background: #545454;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 24px;
}

.popup-title {
  color: #fff;
  font-size: 18px;
  font-weight: 400;
  margin-bottom: 10px;
}

.popup-message {
  color: #fff;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.popup-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  width: 100%;
}

.cancel-button {
  width: 100px;
  height: auto;
  padding: 12px 0;
  border-radius: 16px;
  background: #232323;
  border: 1px solid #575757;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.confirm-button {
  width: 100px;
  height: auto;
  padding: 12px 0;
  border-radius: 16px;
  background: #fada39;
  border: 1px solid #575757;
  color: #000;
  font-size: 18px;
  font-weight: 600;
}
</style>
