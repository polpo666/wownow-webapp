<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="create-page">
    <van-nav-bar title="新建" fixed left-arrow @click-left="goBack" />
    <div class="page-content">
      <h1>新建</h1>
      <p>这是新建页面内容</p>
    </div>
  </div>
</template>

<style scoped>
.create-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.page-content {
  padding: 56px 16px 16px;
}
</style>
