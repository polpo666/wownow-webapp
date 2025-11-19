<script setup lang="ts">
import { RouterView } from 'vue-router'
import TabbarLayout from '@/layouts/tabbar-layout.vue'
</script>

<template>
  <TabbarLayout>
    <RouterView />
  </TabbarLayout>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #000;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>
