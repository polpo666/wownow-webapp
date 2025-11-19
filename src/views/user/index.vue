<template>
  <div class="user-page">
    <!-- 背景 -->
    <div class="bg-cover"></div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <img src="@/assets/user/logo.png" alt="logo" class="logo-image" />
        <p class="logo-text">WOWNOW</p>
      </div>

      <!-- 主要内容卡片 -->
      <div class="main-card">
        <!-- 背景图 -->
        <div class="card-bg">
          <img src="@/assets/user/bg.png" alt="bg" class="w-full" />
        </div>

        <div class="card-content">
          <!-- 用户信息卡片 -->
          <div class="user-card" @click="handleUserCardClick">
            <div class="user-avatar">
              <img
                v-if="isLoggedIn && user?.avatar"
                :src="user.avatar"
                alt="avatar"
                class="avatar-img"
              />
              <img v-else src="@/assets/user/avatar.png" alt="avatar" class="avatar-img" />
            </div>
            <div class="user-info">
              <div class="user-name">
                {{ isLoggedIn ? user?.nickname || '微信用户' : '点击登录' }}
              </div>
              <div class="user-id">
                {{ isLoggedIn ? 'WowNow' + user?.id : '登录后获取更多功能信息' }}
              </div>
            </div>
            <van-icon name="arrow" size="20" color="#000" />
          </div>

          <!-- 功能列表 -->
          <div class="menu-list">
            <div class="menu-item border-bottom" @click="handleCouponClick">
              <span class="menu-text">优惠券中心</span>
              <van-icon name="arrow" size="20" color="#000" />
            </div>

            <div class="menu-item border-bottom" @click="handlePrivacyClick">
              <span class="menu-text">隐私声明</span>
              <van-icon name="arrow" size="20" color="#000" />
            </div>

            <div class="menu-item" @click="handleAboutClick">
              <span class="menu-text">关于WOWNOW</span>
              <van-icon name="arrow" size="20" color="#000" />
            </div>
          </div>

          <!-- 版本信息 -->
          <div class="version-info">版本:{{ buildVersion }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)

// 版本信息
const buildVersion = import.meta.env.VITE_BUILD_VERSION || 'dev'

// 用户卡片点击
const handleUserCardClick = () => {
  if (isLoggedIn.value) {
    // 跳转到个人资料页面
    router.push('/user/profile')
  } else {
    // 显示登录弹窗
    handleLogin()
  }
}

// 登录
const handleLogin = () => {
  authStore.setShowLoginModal(true)
}

// 优惠券中心
const handleCouponClick = () => {
  if (!isLoggedIn.value) {
    // TODO: 显示提示
    return
  }
  router.push('/user/coupon')
}

// 隐私声明
const handlePrivacyClick = () => {
  router.push('/agreement/privacy')
}

// 关于 WOWNOW
const handleAboutClick = () => {
  router.push('/user/about')
}
</script>

<style scoped>
.user-page {
  min-height: 100vh;
  position: relative;
  overflow-y: auto;
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

/* 内容包装器 */
.content-wrapper {
  padding-top: 15px;
}

/* Logo 区域 */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
  margin-bottom: 50px;
}

.logo-image {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
}

.logo-text {
  font-size: 18px;
  font-weight: 500;
  line-height: 25px;
  color: #fff;
  margin: 0;
}

/* 主卡片 */
.main-card {
  margin: 0 15px;
  padding-top: 50px;
  border-radius: 40px;
  overflow: hidden;
  position: relative;
}

.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
}

.card-bg img {
  display: block;
  width: 100%;
}

.card-content {
  background: #fefbee;
  padding: 0 15px 20px;
  position: relative;
  z-index: 1;
}

/* 用户卡片 */
.user-card {
  border: 1px solid #0d0d0d;
  border-radius: 16px;
  margin-bottom: 24px;
  padding: 16px 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.user-card:active {
  opacity: 0.8;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  background: #e9e6ff;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  margin-left: 16px;
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #0a0a0a;
}

.user-id {
  font-size: 12px;
  color: #9c9c9c;
  margin-top: 4px;
}

/* 菜单列表 */
.menu-list {
  border: 1px solid #000;
  border-radius: 16px;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
}

.menu-item {
  padding: 14px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.menu-item.border-bottom::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 15px;
  right: 15px;
  height: 1px;
  background: #000;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
  color: #0a0a0a;
}

/* 版本信息 */
.version-info {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 10px;
}
</style>
