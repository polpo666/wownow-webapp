<template>
  <div class="profile-page">
    <!-- 背景 -->
    <div class="bg-cover"></div>

    <!-- 导航栏 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" size="20" color="#fff" @click="goBack" />
      <span class="nav-title">个人资料</span>
      <div class="nav-placeholder"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <label class="avatar-label">
          <input type="file" accept="image/*" class="avatar-input" @change="handleAvatarChange" />
          <div class="avatar-container">
            <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" class="avatar-image" />
            <img v-else src="@/assets/user/avatar.png" alt="avatar" class="avatar-image" />
            <div class="avatar-edit-icon">
              <img src="@/assets/svgs/icon-avatar-edit.svg" alt="edit" />
            </div>
          </div>
        </label>
      </div>

      <!-- 表单区域 -->
      <div class="form-section">
        <!-- 昵称 -->
        <div class="form-item">
          <label class="form-label">昵称</label>
          <div class="form-input-wrapper" @click="goEdit">
            <span class="form-value">{{ isLoggedIn ? user?.nickname || '微信用户' : '--' }}</span>
            <img src="@/assets/svgs/icon-edit.svg" alt="edit" class="edit-icon" />
          </div>
        </div>

        <!-- 手机号 -->
        <div class="form-item">
          <label class="form-label">手机号</label>
          <div class="form-input-wrapper readonly">
            <span class="form-value">{{ isLoggedIn ? user?.phone || '--' : '--' }}</span>
          </div>
        </div>
      </div>

      <!-- 退出登录按钮 -->
      <div class="logout-section">
        <van-button type="primary" block @click="handleLogout"> 退出登录 </van-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { updateUserDetail } from '@/api/auth'
import { ossUploadPresign, uploadToOSS } from '@/api/upload'
import type { Attachment } from '@/api/upload'
import {
  showLoadingToast,
  closeToast,
  showFailToast,
  showSuccessToast,
  showConfirmDialog,
} from 'vant'

const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)
const avatarUrl = ref('')

onMounted(() => {
  if (isLoggedIn.value && user.value) {
    avatarUrl.value = user.value.avatar || ''
  }
})

const goBack = () => {
  router.back()
}

const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  showLoadingToast({
    message: '上传中...',
    forbidClick: true,
  })

  try {
    const uploadResult = await uploadFile(file)

    if (uploadResult) {
      const updateResponse = await updateUserDetail({ avatar: uploadResult.url })

      if (updateResponse.code === 0 && updateResponse.data?.success) {
        avatarUrl.value = uploadResult.url
        authStore.updateUserInfo({ avatar: uploadResult.url })

        closeToast()
        showSuccessToast('头像更新成功')
      } else {
        closeToast()
        showFailToast(updateResponse.message || '头像更新失败')
        console.warn('Failed to update user avatar:', updateResponse)
      }
    }
  } catch (error: unknown) {
    closeToast()
    let errorMessage = '头像更新失败'
    if (error instanceof Error) {
      errorMessage = error.message
      // 如果是 403 错误，提供更详细的提示
      if (error.message.includes('403')) {
        errorMessage = '上传权限不足，请检查上传凭证或联系管理员'
      }
    }
    showFailToast(errorMessage)
    console.error('Avatar upload failed:', error)
  }

  // 清空 input，以便可以重复选择同一文件
  target.value = ''
}

// 上传文件
const uploadFile = async (file: File): Promise<Attachment | null> => {
  const filename = file.name || `avatar-${Date.now()}.jpg`
  const contentType = file.type || 'image/jpeg'
  const size = file.size

  try {
    // 获取预签名 URL
    const presignResponse = await ossUploadPresign({
      filename,
      contentType,
      size,
    })

    if (presignResponse.code !== 0 || !presignResponse.data) {
      throw new Error(presignResponse.message || '获取上传凭证失败')
    }

    const { uploadUrl, publicUrl, originalFilename } = presignResponse.data

    // 上传文件到 OSS
    await uploadToOSS(file, uploadUrl, contentType)

    return {
      url: publicUrl,
      name: originalFilename,
      contentType: contentType,
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '上传失败'
    throw new Error(errorMessage)
  }
}

const goEdit = () => {
  router.push('/user/profile/nickname')
}

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确认退出登录？',
    })
    authStore.logout()
    router.replace('/home')
    showSuccessToast('已退出登录')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.profile-page {
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

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.avatar-label {
  cursor: pointer;
  position: relative;
}

.avatar-input {
  display: none;
}

.avatar-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  position: relative;
  background: #e9e6ff;
}

.avatar-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  z-index: 1;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-edit-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding: 0;
}

.avatar-edit-icon img {
  width: 100%;
  height: 100%;
}

/* 表单区域 */
.form-section {
  margin-bottom: 40px;
}

.form-item {
  margin-bottom: 40px;
}

.form-label {
  display: block;
  font-size: 16px;
  color: #9c9c9c;
  margin-bottom: 8px;
}

.form-input-wrapper {
  background: #232323;
  border-radius: 16px;
  padding: 16px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: opacity 0.3s;
}

.form-input-wrapper:active {
  opacity: 0.8;
}

.form-input-wrapper.readonly {
  cursor: default;
}

.form-value {
  color: #fff;
  font-size: 14px;
  flex: 1;
}

.edit-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* 退出登录按钮 */
.logout-section {
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
</style>
