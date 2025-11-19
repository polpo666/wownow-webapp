<template>
  <div class="nickname-page">
    <!-- 背景 -->
    <div class="bg-cover"></div>

    <!-- 导航栏 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" size="20" color="#fff" @click="goBack" />
      <span class="nav-title">修改昵称</span>
      <div class="nav-placeholder"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <div class="input-wrapper">
        <input
          v-model="nickname"
          type="text"
          class="nickname-input"
          placeholder="请输入昵称"
          maxlength="20"
        />
        <span class="char-count">{{ nickname.length }}/20</span>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="save-section">
      <van-button
        type="primary"
        block
        :disabled="isEmpty"
        :class="{ 'disabled-button': isEmpty }"
        @click="handleSave"
      >
        保存
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { updateUserDetail } from '@/api/auth'
import { showLoadingToast, closeToast, showFailToast, showSuccessToast } from 'vant'

const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)
const nickname = ref('')

const isEmpty = computed(() => nickname.value.trim().length === 0)

onMounted(() => {
  if (isLoggedIn.value && user.value) {
    nickname.value = user.value.nickname || ''
  }
})

const goBack = () => {
  router.back()
}

const handleSave = async () => {
  if (isEmpty.value) {
    showFailToast('昵称不能为空')
    return
  }

  if (!isLoggedIn.value || !user.value) {
    showFailToast('请先登录')
    return
  }

  if (nickname.value === user.value?.nickname) {
    showSuccessToast('保存成功')
    setTimeout(() => {
      router.back()
    }, 300)
    return
  }

  showLoadingToast({
    message: '保存中...',
    forbidClick: true,
  })

  try {
    const result = await updateUserDetail({ nickname: nickname.value })

    if (result.code === 0 && result.data?.success) {
      authStore.updateUserInfo({ nickname: nickname.value })
      closeToast()
      showSuccessToast('保存成功')
      setTimeout(() => {
        router.back()
      }, 300)
    } else {
      console.warn('更新用户信息失败:', result.message)
      closeToast()
      showFailToast('保存失败，请稍后重试')
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    closeToast()
    showFailToast('保存失败，请稍后重试')
  }
}
</script>

<style scoped>
.nickname-page {
  min-height: 100vh;
  position: relative;
  overflow-y: auto;
  padding-bottom: 100px;
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

/* 内容区域 */
.content-wrapper {
  padding: 15px;
}

.input-wrapper {
  background: #232323;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.nickname-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
}

.nickname-input::placeholder {
  color: rgba(255, 255, 255, 0.55);
}

.char-count {
  font-size: 14px;
  color: #9c9c9c;
  flex-shrink: 0;
}

/* 保存按钮 */
.save-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 15px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: transparent;
}

:deep(.van-button--primary) {
  background: #fada39;
  border: none;
  color: #0a0a0a;
  font-weight: 500;
}

:deep(.van-button--disabled) {
  background: #7a7a7a !important;
  color: #a6a6a6 !important;
}
</style>
