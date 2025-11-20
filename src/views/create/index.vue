<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // 直接跳转到分类选择页面
  router.replace('/create/category')
})
</script>

<template>
  <div class="create-page">
    <!-- 这个页面会自动跳转到 category 页面 -->
  </div>
</template>

<style scoped>
.create-page {
  min-height: 100vh;
  background: #0d0d0d;
}
</style>
