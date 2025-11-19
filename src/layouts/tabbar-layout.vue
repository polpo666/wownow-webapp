<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import CustomTabbar from '@/components/custom-tabbar.vue'
import { shouldShowTabbar } from '@/config/tabbar'

const route = useRoute()

// 判断当前页面是否需要显示 Tabbar
const showTabbar = computed(() => {
  return shouldShowTabbar(route.path)
})
</script>

<template>
  <div class="tabbar-layout">
    <div class="layout-content" :class="{ 'has-tabbar': showTabbar }">
      <slot />
    </div>

    <!-- 只在需要的页面显示 Tabbar -->
    <CustomTabbar v-if="showTabbar" />
  </div>
</template>

<style scoped>
.tabbar-layout {
  width: 100%;
  min-height: 100vh;
  background: url('@/assets/bg.jpg') no-repeat center center fixed;
  background-size: cover;
}

.layout-content {
  width: 100%;
  min-height: 100vh;
}

/* 有 Tabbar 的页面需要留出底部空间 */
.layout-content.has-tabbar {
  padding-bottom: 50px;
}
</style>
