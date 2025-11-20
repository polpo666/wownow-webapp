<template>
  <div class="category-page">
    <nav-bar title="选择分类" :is-back="true" :default-back-behavior="false" @back="onBack" />

    <div class="content-wrapper">
      <div v-if="categorys.length === 0" class="empty-state">
        <span class="empty-text">暂无数据</span>
      </div>
      <div v-else class="category-grid">
        <div
          v-for="item in categorys"
          :key="item.category.id"
          class="category-item"
          :class="{ selected: item.isSelected }"
          @click="selectCategory(item)"
        >
          <div class="category-image-wrapper">
            <img
              v-if="item.category.coverUrl"
              :src="item.category.coverUrl + '?x-oss-process=image/resize,p_50'"
              alt="category"
              class="category-image"
            />
            <img v-else src="@/assets/base/no-data.png" alt="placeholder" class="category-image" />
          </div>
          <div class="category-name">{{ item.category.name }}</div>
        </div>
      </div>
    </div>

    <div class="bottom-actions">
      <van-button
        block
        type="primary"
        color="#FADA39"
        class="next-button"
        :disabled="disabled"
        @click="onNext"
      >
        <span class="next-button-text">下一步</span>
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategoryWithTemplates } from '@/api/template'
import { useChatStore } from '@/stores/chat'
import NavBar from '@/components/nav-bar.vue'

const router = useRouter()
const chatStore = useChatStore()

interface CategoryItem {
  category: {
    id: number
    name: string
    coverUrl?: string
  }
  subCategories: any[]
  isSelected: boolean
}

const categorys = ref<CategoryItem[]>([])

const disabled = computed(() => {
  return !categorys.value.some((item) => item.isSelected)
})

const fetchCategory = async () => {
  try {
    const res = await getCategoryWithTemplates({})
    if (res.code === 0 && res.data) {
      const { list } = res.data
      categorys.value = list.map((item: any) => ({ ...item, isSelected: false }))
    }
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const selectCategory = (item: CategoryItem) => {
  categorys.value = categorys.value.map((categoryItem) => {
    return {
      ...categoryItem,
      isSelected: item.category.id === categoryItem.category.id,
    }
  })
}

const onNext = () => {
  const selectedCategory = categorys.value.find((item) => item.isSelected)
  if (selectedCategory) {
    chatStore.setCategory(selectedCategory)
    router.push('/create/craft')
  }
}

const onBack = () => {
  router.back()
}

onMounted(() => {
  fetchCategory()
})
</script>

<style scoped>
.category-page {
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

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.category-item {
  border-radius: 8px;
  background: radial-gradient(50% 49.76% at 50% 50.24%, hsl(0, 0%, 31%) 0%, hsl(0, 0%, 13%) 100%);
  border: 1px solid transparent;
  overflow: hidden;
  transition: border-color 0.2s;
}

.category-item.selected {
  border-color: #fada39;
}

.category-image-wrapper {
  height: 128px;
  padding: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.category-name {
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

.next-button {
  width: 100%;
  border-radius: 16px;
  height: 44px;
  border: none;
}

.next-button:disabled {
  background-color: #ccc !important;
  color: #a6a6a6 !important;
}

.next-button-text {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}
</style>
