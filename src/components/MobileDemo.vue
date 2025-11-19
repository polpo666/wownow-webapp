<script setup lang="ts">
import { ref, onMounted } from 'vue'

const screenWidth = ref(0)
const fontSize = ref(0)

const updateInfo = () => {
  screenWidth.value = window.innerWidth
  fontSize.value = parseFloat(getComputedStyle(document.documentElement).fontSize)
}

onMounted(() => {
  updateInfo()
  window.addEventListener('resize', updateInfo)
})
</script>

<template>
  <div class="mobile-demo">
    <div class="header">
      <h1>移动端适配示例</h1>
      <div class="info">
        <p>屏幕宽度: {{ screenWidth }}px</p>
        <p>根字体大小: {{ fontSize.toFixed(2) }}px</p>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <h2>按钮示例</h2>
        <div class="button-group">
          <button class="btn btn-primary">主要按钮</button>
          <button class="btn btn-secondary">次要按钮</button>
        </div>
      </div>

      <div class="section">
        <h2>卡片示例</h2>
        <div class="card">
          <div class="card-header">卡片标题</div>
          <div class="card-body">
            <p>这是一个响应式卡片组件，宽度为300px（设计稿尺寸）</p>
            <p>在不同屏幕上会自动按比例缩放</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>文字大小示例</h2>
        <p class="text-xs">12px - 超小号文字</p>
        <p class="text-sm">14px - 小号文字</p>
        <p class="text-base">16px - 基础文字</p>
        <p class="text-lg">18px - 大号文字</p>
        <p class="text-xl">20px - 超大号文字</p>
        <p class="text-2xl">24px - 标题文字</p>
      </div>

      <div class="section">
        <h2>间距示例</h2>
        <div class="spacing-demo">
          <div class="box p-8">padding: 8px</div>
          <div class="box p-16">padding: 16px</div>
          <div class="box p-24">padding: 24px</div>
        </div>
      </div>

      <div class="section">
        <h2>布局示例</h2>
        <div class="grid">
          <div class="grid-item">网格1</div>
          <div class="grid-item">网格2</div>
          <div class="grid-item">网格3</div>
          <div class="grid-item">网格4</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>© 2025 WowNow Web App</p>
    </div>
  </div>
</template>

<style scoped>
/* 基础布局 - 所有px值都会被自动转换为rem */
.mobile-demo {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 头部 */
.header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.header h1 {
  font-size: 28px;
  margin-bottom: 16px;
}

.info {
  font-size: 14px;
  opacity: 0.9;
}

.info p {
  margin: 4px 0;
}

/* 内容区域 */
.content {
  padding: 20px;
}

.section {
  margin-bottom: 32px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section h2 {
  font-size: 20px;
  margin-bottom: 16px;
  color: #333;
}

/* 按钮 */
.button-group {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:active {
  background: #5568d3;
}

.btn-secondary {
  background: #e0e7ff;
  color: #667eea;
}

.btn-secondary:active {
  background: #c7d2fe;
}

/* 卡片 */
.card {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  padding: 16px;
  background: #f9fafb;
  font-weight: 600;
  font-size: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.card-body {
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

/* 文字大小 */
.text-xs {
  font-size: 12px;
  margin: 8px 0;
  color: #666;
}
.text-sm {
  font-size: 14px;
  margin: 8px 0;
  color: #666;
}
.text-base {
  font-size: 16px;
  margin: 8px 0;
  color: #333;
}
.text-lg {
  font-size: 18px;
  margin: 8px 0;
  color: #333;
}
.text-xl {
  font-size: 20px;
  margin: 8px 0;
  color: #333;
  font-weight: 500;
}
.text-2xl {
  font-size: 24px;
  margin: 8px 0;
  color: #333;
  font-weight: 600;
}

/* 间距示例 */
.spacing-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.box {
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.p-8 {
  padding: 8px;
}
.p-16 {
  padding: 16px;
}
.p-24 {
  padding: 24px;
}

/* 网格布局 */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.grid-item {
  padding: 24px;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
  color: #8b4513;
  font-weight: 500;
}

/* 底部 */
.footer {
  padding: 24px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
