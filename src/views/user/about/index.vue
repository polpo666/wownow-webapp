<template>
  <div class="about-page">
    <!-- 背景 -->
    <div class="bg-cover"></div>

    <!-- 导航栏 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" size="20" color="#fff" @click="goBack" />
      <span class="nav-title">关于WOWNOW</span>
      <div class="nav-placeholder"></div>
    </div>

    <!-- Logo 和版本号 -->
    <div class="logo-section">
      <img src="@/assets/user/logo.png" alt="logo" class="logo-image" />
      <p class="version-text">WOWNOW {{ version }}</p>
    </div>

    <!-- 底部信息 -->
    <div class="footer-section">
      <div class="links">
        <span class="link-item" @click="onClickUserAgreement">用户协议</span>
        <span class="link-divider">|</span>
        <span class="link-item" @click="onClickPrivacyPolicy">隐私协议</span>
      </div>
      <p class="copyright">版权归广州轻变量信息科技有限公司所有</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const version = ref('')

onMounted(() => {
  // 从环境变量获取版本号
  version.value = import.meta.env.VITE_BUILD_VERSION || 'dev'
})

const goBack = () => {
  router.back()
}

const onClickUserAgreement = () => {
  router.push('/agreement/user')
}

const onClickPrivacyPolicy = () => {
  router.push('/agreement/privacy')
}
</script>

<style scoped>
.about-page {
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

/* Logo 区域 */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
}

.logo-image {
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
}

.version-text {
  font-size: 14px;
  font-weight: 400;
  line-height: 25px;
  color: #fff;
  margin: 0;
}

/* 底部信息 */
.footer-section {
  position: fixed;
  bottom: 22px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-size: 12px;
  font-weight: 400;
}

.links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.link-item {
  color: #999999;
  cursor: pointer;
  transition: color 0.3s;
}

.link-item:hover {
  color: #fff;
}

.link-divider {
  color: #999999;
}

.copyright {
  margin: 0;
  color: #999999;
}
</style>
