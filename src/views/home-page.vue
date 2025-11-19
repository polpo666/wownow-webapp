<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const demos = [
  {
    title: '移动端适配示例',
    desc: '自定义组件展示 postcss-pxtorem + flexible 适配效果',
    path: '/mobile-demo',
    icon: '📱',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    title: 'Vant 组件库示例',
    desc: '展示 Vant 组件库的常用组件和功能',
    path: '/vant-demo',
    icon: '🎨',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
]

const goToDemo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="home-page">
    <div class="header">
      <div class="logo">🚀</div>
      <h1>WowNow Web App</h1>
      <p class="subtitle">移动端适配 + Vant 组件库示例</p>
    </div>

    <div class="content">
      <div class="info-card">
        <h2>✨ 技术栈</h2>
        <div class="tech-list">
          <div class="tech-item">Vue 3</div>
          <div class="tech-item">Vite</div>
          <div class="tech-item">TypeScript</div>
          <div class="tech-item">Pinia</div>
          <div class="tech-item">Vue Router</div>
          <div class="tech-item">Vant 4</div>
          <div class="tech-item">postcss-pxtorem</div>
          <div class="tech-item">flexible.ts</div>
        </div>
      </div>

      <div class="demos-section">
        <h2>📚 示例展示</h2>
        <div class="demo-list">
          <div
            v-for="demo in demos"
            :key="demo.path"
            class="demo-card"
            :style="{ background: demo.color }"
            @click="goToDemo(demo.path)"
          >
            <div class="demo-icon">{{ demo.icon }}</div>
            <h3>{{ demo.title }}</h3>
            <p>{{ demo.desc }}</p>
            <div class="arrow">→</div>
          </div>
        </div>
      </div>

      <div class="features-section">
        <h2>🎯 特性说明</h2>
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">📐</div>
            <div class="feature-content">
              <h3>移动端适配</h3>
              <p>基于 postcss-pxtorem + flexible.ts 方案，开发时直接使用 px，自动转换为 rem</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎨</div>
            <div class="feature-content">
              <h3>Vant 组件库</h3>
              <p>集成 Vant 4.x，自动按需引入，无需手动导入组件和样式</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⚡️</div>
            <div class="feature-content">
              <h3>开发体验</h3>
              <p>Vite + Vue 3 + TypeScript，极速热更新，完整的类型提示</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📱</div>
            <div class="feature-content">
              <h3>多设备支持</h3>
              <p>完美适配各种屏幕尺寸，从 iPhone SE 到 iPad 都能正常显示</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Built with ❤️ by AI Assistant</p>
      <p class="tip">请使用移动设备或浏览器的移动端模式查看效果</p>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f8fa 0%, #ffffff 100%);
}

.header {
  text-align: center;
  padding: 60px 20px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0 0 32px 32px;
}

.logo {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.header h1 {
  font-size: 32px;
  margin-bottom: 8px;
  font-weight: 700;
}

.subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.content {
  padding: 24px 16px;
}

.info-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.info-card h2,
.demos-section h2,
.features-section h2 {
  font-size: 20px;
  margin-bottom: 16px;
  color: #333;
}

.tech-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.tech-item {
  padding: 12px;
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #5a4a7f;
}

.demos-section {
  margin-bottom: 24px;
}

.demo-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-card {
  position: relative;
  padding: 24px;
  border-radius: 16px;
  color: white;
  cursor: pointer;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.demo-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s;
}

.demo-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.demo-card:active::before {
  opacity: 1;
}

.demo-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.demo-card h3 {
  font-size: 20px;
  margin-bottom: 8px;
  font-weight: 600;
}

.demo-card p {
  font-size: 14px;
  opacity: 0.95;
  line-height: 1.5;
}

.arrow {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  font-weight: bold;
}

.features-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  gap: 16px;
}

.feature-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.feature-content h3 {
  font-size: 16px;
  margin-bottom: 4px;
  color: #333;
}

.feature-content p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.footer {
  text-align: center;
  padding: 32px 20px;
  color: #999;
  font-size: 14px;
}

.footer p {
  margin: 8px 0;
}

.tip {
  font-size: 12px;
  color: #bbb;
}
</style>
