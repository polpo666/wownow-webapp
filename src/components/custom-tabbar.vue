<template>
  <div v-if="shouldShowTabbar" class="custom-tabbar">
    <van-tabbar
      v-model="active"
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-bottom="true"
      @change="onChange"
    >
      <van-tabbar-item v-for="(item, index) in tabbarConfig" :key="index">
        <!-- 特殊的创建按钮 -->
        <template v-if="item.isSpecial">
          <div class="create-button" @click="handleCreate">
            <van-icon name="plus" size="18" color="#000" />
          </div>
        </template>
        <!-- 普通文字 -->
        <template v-else>
          {{ item.text }}
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { tabbarConfig, getActiveTabIndex } from '@/config/tabbar'

const router = useRouter()
const route = useRoute()

// 当前激活的标签
const active = ref(0)

// 是否应该显示 tabbar（create 页面不显示）
const shouldShowTabbar = computed(() => {
  return route.path !== '/create'
})

// 根据当前路由更新激活状态
watch(
  () => route.path,
  (newPath) => {
    const index = getActiveTabIndex(newPath)
    if (index !== -1) {
      active.value = index
    }
  },
  { immediate: true },
)

// 切换标签
const onChange = (index: number) => {
  const item = tabbarConfig[index]
  if (!item) return

  // 普通标签切换
  if (route.path !== item.path) {
    router.push(item.path)
  }
}

// 处理创建按钮点击
const handleCreate = () => {
  // TODO: 这里可以添加登录验证等逻辑
  // 示例：检查是否登录，未登录则显示登录弹窗
  router.push('/create')
}
</script>

<style scoped>
/* 创建按钮样式 */
.create-button {
  width: 56px;
  height: 40px;
  padding: 8px 16px;
  border-radius: 10px;
  background: #fada39;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(250, 218, 57, 0.4);
  transition: all 0.3s;
}

.create-button:active {
  transform: scale(0.95);
  box-shadow: 0 2px 8px rgba(250, 218, 57, 0.4);
}

/* 加号图标加粗 */
.create-button :deep(.van-icon) {
  font-weight: 700;
}

/* 自定义 Tabbar 样式 */
:deep(.van-tabbar) {
  background: #0d0d0d;
  border: none;
  border-top: none;
  height: 64px;
}

/* 普通状态的标签项 */
:deep(.van-tabbar-item) {
  font-size: 14px;
  color: #999999;
  font-weight: 400;
}

/* 激活状态的标签项 */
:deep(.van-tabbar-item--active) {
  font-size: 14px;
  color: #ffffff;
  font-weight: 400;
  background: none;
}

/* 隐藏默认图标 */
:deep(.van-tabbar-item__icon) {
  display: none;
}

/* 文字样式 */
:deep(.van-tabbar-item__text) {
  font-size: 14px;
  font-weight: 400;
  margin-top: 0;
}

/* 激活状态下的下划线（只对普通文字标签生效，不影响创建按钮） */
:deep(.van-tabbar-item--active .van-tabbar-item__text) {
  position: relative;
}

:deep(.van-tabbar-item--active .van-tabbar-item__text::after) {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2px;
  background: #fcdf4c;
  border-radius: 1px;
}
</style>
