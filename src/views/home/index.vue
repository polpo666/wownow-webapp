<template>
  <div class="home-page">
    <!-- 背景 -->
    <div class="bg-cover"></div>

    <!-- 导航栏 -->
    <div class="nav-bar">
      <div class="nav-placeholder"></div>
      <span class="nav-title"></span>
      <div class="nav-placeholder"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content-wrapper">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh" :disabled="loading || !isAtTop">
        <div id="home-header" class="home-header">
          <!-- banner -->
          <div v-if="bannerList.length > 0" class="banner-section">
            <van-swipe
              :autoplay="3000"
              :show-indicators="false"
              :loop="true"
              :touchable="true"
              @change="onBannerChange"
            >
              <van-swipe-item
                v-for="item in bannerList"
                :key="item.id"
                class="banner-item"
                @click="onClickBanner(item)"
              >
                <img :src="item.imageUrl" :alt="item.altText" class="banner-image" />
              </van-swipe-item>
            </van-swipe>
          </div>

          <!-- tab 导航栏 -->
          <div
            id="template-tabs"
            class="template-tabs"
            :class="{ 'has-banner': bannerList.length > 0 }"
          >
            <div
              v-for="tab in tabList"
              :key="tab.name"
              ref="tabItemRefs"
              class="tab-item"
              :class="{ active: activeTab === tab.name }"
              @click="onTabChange(tab.name)"
            >
              {{ tab.title }}
            </div>
            <div class="tab-indicator" :style="indicatorStyle"></div>
          </div>
        </div>

        <!-- tab 内容区域 -->
        <rec-templates
          v-if="activeTab === 'hot'"
          ref="recTemplatesRef"
          :has-banner="bannerList.length > 0"
          class="tab-content"
        />

        <templates
          v-if="activeTab === 'more'"
          ref="templatesRef"
          class="tab-content"
          @tab-change="onStyleTabChange"
        />
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getBannerList } from '@/api/promotion'
import type { WownowBanner } from '@/types/promotion'
import { showSuccessToast, showFailToast } from 'vant'
import RecTemplates from '@/views/home/components/rec-templates.vue'
import Templates from '@/views/home/components/templates.vue'

const router = useRouter()

const tabList = [
  { title: '热门推荐', name: 'hot' },
  { title: '更多推荐', name: 'more' },
]

const activeTab = ref('hot')
const bannerList = ref<WownowBanner[]>([])
const currentBannerIndex = ref(0)
const refreshing = ref(false)
const loading = ref(false)
const isTabsSticky = ref(false)
const headerHeight = ref(0)
const isAtTop = ref(true)
const recTemplatesRef = ref<InstanceType<typeof RecTemplates> | null>(null)
const templatesRef = ref<InstanceType<typeof Templates> | null>(null)
const tabItemRefs = ref<(HTMLDivElement | null)[]>([])
const indicatorStyle = ref({ width: '0px', left: '0px' })

// 获取 Banner 列表
const fetchBannerList = async () => {
  try {
    const res = await getBannerList('home_top')
    if (res.code === 0 && res.data?.list) {
      bannerList.value = res.data.list
    } else {
      console.warn('failed to fetch banner list: ', res)
    }
  } catch (error) {
    console.error('error fetching banner list: ', error)
    showFailToast('banner加载失败')
  }
}

// Banner 切换
const onBannerChange = (index: number) => {
  currentBannerIndex.value = index
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  currentBannerIndex.value = 0
  try {
    await fetchBannerList()
    // 通知子组件刷新数据
    if (activeTab.value === 'hot' && recTemplatesRef.value) {
      await recTemplatesRef.value.refresh()
    }
    if (activeTab.value === 'more' && templatesRef.value) {
      await templatesRef.value.initPromptStyles()
    }
    showSuccessToast('刷新成功')
  } catch (error) {
    console.error('刷新失败:', error)
    showFailToast('刷新失败')
  } finally {
    refreshing.value = false
  }
}

// 点击 Banner
const onClickBanner = (item: WownowBanner) => {
  router.push(`/home/campaign?id=${item.campaignId}`)
}

// 更新指示器位置
const updateIndicatorPosition = async () => {
  await nextTick()
  const activeIndex = tabList.findIndex((tab) => tab.name === activeTab.value)
  if (activeIndex >= 0 && tabItemRefs.value[activeIndex]) {
    const activeTabElement = tabItemRefs.value[activeIndex]
    const tabsContainer = document.getElementById('template-tabs')
    if (activeTabElement && tabsContainer) {
      const tabRect = activeTabElement.getBoundingClientRect()
      const containerRect = tabsContainer.getBoundingClientRect()
      const left = tabRect.left - containerRect.left
      const width = tabRect.width
      indicatorStyle.value = {
        width: `${width}px`,
        left: `${left}px`,
      }
    }
  }
}

// Tab 切换
const onTabChange = (name: string) => {
  activeTab.value = name
  updateIndicatorPosition()
}

// 获取滚动头部高度
const getScrollHeaderHeight = (): number => {
  const header = document.getElementById('home-header')
  if (header) {
    return header.offsetHeight
  }
  return 0
}

// 风格 Tab 切换
const onStyleTabChange = (event: { tabBarTop: number }) => {
  if (!headerHeight.value) {
    headerHeight.value = getScrollHeaderHeight()
  }
  // 滚动到指定位置
  window.scrollTo({
    top: headerHeight.value - event.tabBarTop,
    behavior: 'smooth',
  })
}

// 滚动监听
const handleScroll = () => {
  const scrollElement = document.documentElement || document.body
  const scrollTop = scrollElement.scrollTop

  // 检测是否在顶部
  isAtTop.value = scrollTop <= 5

  // 检测 tabs 是否吸顶
  if (!headerHeight.value) {
    headerHeight.value = getScrollHeaderHeight()
  }
  if (headerHeight.value > 0) {
    const isSticky = scrollTop >= headerHeight.value
    if (isTabsSticky.value !== isSticky) {
      isTabsSticky.value = isSticky
    }
  }
}

// 监听 activeTab 变化，更新指示器位置
watch(activeTab, () => {
  updateIndicatorPosition()
})

onMounted(async () => {
  await fetchBannerList()
  await nextTick()
  updateIndicatorPosition()
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('touchmove', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('touchmove', handleScroll)
})
</script>

<style scoped>
.home-page {
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

/* 内容区域 */
.content-wrapper {
  min-height: calc(100vh - 44px);
}

.home-header {
  width: 100%;
}

/* Banner 区域 */
.banner-section {
  padding: 15px 0;
}

.banner-item {
  padding: 0 15px;
  height: 150px;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

/* Tab 导航栏 */
.template-tabs {
  width: fit-content;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px;
  border-radius: 24px;
  border: 1px solid #454545;
  display: flex;
  gap: 0;
  position: relative;
}

.template-tabs.has-banner {
  margin-top: 9px;
}

.template-tabs:not(.has-banner) {
  margin-top: 20px;
}

.tab-item {
  display: inline-block;
  padding: 10px 32px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: color 0.3s;
  position: relative;
  z-index: 1;
}

.tab-item.active {
  color: #000;
}

.tab-indicator {
  position: absolute;
  top: 8px;
  height: calc(100% - 16px);
  background: #fada39;
  border-radius: 16px;
  transition: all 0.3s ease;
  z-index: 0;
}

.tab-content {
  flex: 1;
  padding-top: 4px;
}

:deep(.van-pull-refresh) {
  min-height: calc(100vh - 44px);
}

:deep(.van-swipe) {
  height: 150px;
}

:deep(.van-swipe-item) {
  height: 100%;
}
</style>
