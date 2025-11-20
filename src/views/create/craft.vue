<template>
  <div class="craft-page">
    <nav-bar title="选择工艺" :is-back="true" />

    <div class="content-wrapper">
      <div v-if="crafts.length === 0" class="empty-state">
        <span class="empty-text">暂无数据</span>
      </div>
      <div v-else class="craft-grid">
        <div
          v-for="item in crafts"
          :key="item.templates.id"
          class="craft-item"
          :class="{ selected: item.isSelected }"
          @click="selectTemplate(item)"
        >
          <div class="craft-image-wrapper">
            <img
              v-if="item.templates.coverUrl"
              :src="item.templates.coverUrl + '?x-oss-process=image/resize,p_50'"
              alt="craft"
              class="craft-image"
            />
            <img v-else src="@/assets/base/no-data.png" alt="placeholder" class="craft-image" />
          </div>
          <div class="craft-name">{{ item.category.name }}</div>
        </div>
      </div>
    </div>

    <div class="bottom-actions">
      <van-button
        block
        type="primary"
        color="#FADA39"
        class="start-button"
        :disabled="disabled"
        @click="onStartChat"
      >
        <span class="start-button-text">开启创作</span>
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { showFailToast, showConfirmDialog } from 'vant'
import NavBar from '@/components/nav-bar.vue'

const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()

interface CraftItem {
  templates: any
  category: {
    id: number
    name: string
  }
  isSelected: boolean
}

const crafts = ref<CraftItem[]>([])

const disabled = computed(() => {
  return !crafts.value.some((item) => item.isSelected)
})

watch(
  () => chatStore.category,
  (newCategory) => {
    if (newCategory) {
      crafts.value = newCategory.subCategories.map((item: any) => ({
        ...item,
        isSelected: false,
      }))
    }
  },
  { immediate: true },
)

const selectTemplate = (item: CraftItem) => {
  crafts.value = crafts.value.map((craftItem) => {
    return {
      ...craftItem,
      isSelected: item.templates.id === craftItem.templates.id,
    }
  })
}

const onStartChat = async () => {
  if (!authStore.isLoggedIn) {
    try {
      await showConfirmDialog({
        title: '提示',
        message: '您还未登录，请先登录',
        confirmButtonText: '登录',
        cancelButtonText: '取消',
      })
      router.push('/auth')
      return
    } catch {
      // 用户取消
      return
    }
  }

  const selectedCraft = crafts.value.find((item) => item.isSelected)
  if (selectedCraft) {
    chatStore.setChatTemplate(selectedCraft.templates)
    router.push('/chat')
  }
}

onMounted(() => {
  if (chatStore.category) {
    crafts.value = chatStore.category.subCategories.map((item: any) => ({
      ...item,
      isSelected: false,
    }))
  }
})
</script>

<style scoped>
.craft-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
  color: #fff;
  padding-bottom: env(safe-area-inset-bottom);
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.empty-text {
  color: #999;
}

.craft-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.craft-item {
  border-radius: 8px;
  background: radial-gradient(50% 49.76% at 50% 50.24%, hsl(0, 0%, 31%) 0%, hsl(0, 0%, 13%) 100%);
  border: 1px solid transparent;
  overflow: hidden;
  transition: border-color 0.2s;
}

.craft-item.selected {
  border-color: #fada39;
}

.craft-image-wrapper {
  height: 128px;
  padding: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.craft-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.craft-name {
  color: #fff;
  padding: 10px 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
}

.bottom-actions {
  padding: 8px 16px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
}

.start-button {
  width: 100%;
  border-radius: 16px;
  height: 44px;
  border: none;
}

.start-button:disabled {
  background-color: #ccc !important;
  color: #a6a6a6 !important;
}

.start-button-text {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}
</style>
