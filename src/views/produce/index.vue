<template>
  <div class="produce-page">
    <nav-bar title="绑定设备" :is-back="true" />

    <div class="content-wrapper">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <div v-if="isLoading && deviceList.length === 0" class="loading-container">
          <van-loading vertical>加载中...</van-loading>
        </div>

        <div v-else>
          <div
            v-for="device in deviceList"
            :key="device.id"
            class="device-item"
            :class="{ 'device-item-selected': selectedDevice?.id === device.id }"
            @click="handleDeviceSelect(device)"
          >
            <img src="@/assets/produce/device.png" class="device-icon" alt="device" />
            <div class="device-info">
              <div
                class="device-name"
                :class="{ 'device-name-selected': selectedDevice?.id === device.id }"
              >
                {{ device.deviceName }}
              </div>
              <div class="device-address">
                <span v-if="device.distance">距你{{ formatDistance(device.distance) }} |</span>
                {{ device.address }}
              </div>
            </div>
            <img
              v-if="selectedDevice?.id === device.id"
              src="@/assets/device/device-checked.png"
              class="device-checked"
              alt="checked"
            />
          </div>

          <div v-if="loadingMore" class="loading-more">
            <van-loading>加载中...</van-loading>
          </div>

          <div v-if="noMoreData && deviceList.length > 0" class="no-more">没有更多数据了</div>
        </div>
      </van-pull-refresh>
    </div>

    <div class="bottom-actions">
      <van-button block class="cancel-button" @click="onCancel">
        <span class="cancel-button-text">取消</span>
      </van-button>
      <van-button block color="#FADA39" class="confirm-button" @click="goConfigPage">
        <span class="confirm-button-text">确认下单</span>
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDeviceList } from '@/api/device'
import type { Device } from '@/types/order'
import { useProduceStore } from '@/stores/produce'
import { showFailToast, showToast } from 'vant'
import NavBar from '@/components/nav-bar.vue'

const router = useRouter()
const produceStore = useProduceStore()

const deviceList = ref<Device[]>([])
const selectedDevice = ref<Device | null>(null)
const isLoading = ref(false)
const refreshing = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const noMoreData = computed(() => !hasMore.value && deviceList.value.length > 0)

// 格式化距离
function formatDistance(distance: number | string): string {
  if (typeof distance === 'string') {
    return distance
  }
  if (distance < 1000) {
    return `${Math.round(distance)}m`
  }
  return `${(distance / 1000).toFixed(1)}km`
}

// 选择设备
const handleDeviceSelect = (device: Device) => {
  selectedDevice.value = device
  produceStore.setDeviceId(device.id)
}

// 查询设备列表
const queryDeviceList = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      isLoading.value = true
      currentPage.value = 1
      hasMore.value = true
    } else {
      loadingMore.value = true
    }

    const res = await getDeviceList({
      withDistance: false,
      page: currentPage.value,
      pageSize: pageSize.value,
    })

    const list = res.data?.list || []
    const totalCount = res.data?.totalCount || 0

    if (res.code === 0) {
      if (isRefresh) {
        deviceList.value = list
        // 自动选中第一个设备
        if (list.length > 0 && list[0]) {
          selectedDevice.value = list[0]
          produceStore.setDeviceId(list[0].id)
        }
      } else {
        deviceList.value = [...deviceList.value, ...list]
      }

      total.value = totalCount
      hasMore.value = deviceList.value.length < totalCount

      if (list.length > 0) {
        currentPage.value = currentPage.value + 1
      }
    } else {
      showFailToast(res.message || '获取设备列表失败')
    }
  } catch (error) {
    console.error('加载设备列表失败:', error)
    showFailToast('加载失败')
  } finally {
    isLoading.value = false
    loadingMore.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  queryDeviceList(true)
}

// 触底加载更多
let scrollContainer: HTMLElement | null = null
const handleScroll = () => {
  if (loadingMore.value || !hasMore.value) return

  if (scrollContainer) {
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      queryDeviceList(false)
    }
  }
}

// 取消
const onCancel = () => {
  router.back()
}

// 确认下单
const goConfigPage = () => {
  if (!produceStore.deviceId) {
    showToast('请选择一台设备')
    return
  }

  produceStore.setQuantity(1)
  produceStore.clearNfc()

  router.push('/produce/config')
}

onMounted(() => {
  queryDeviceList(true)
  // 监听滚动
  scrollContainer = document.querySelector('.content-wrapper')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.produce-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
}

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

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 80px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.device-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 8px 16px;
  background: #232323;
  border-radius: 14px;
  border: 2px solid #232323;
  cursor: pointer;
  transition: all 0.3s;
}

.device-item-selected {
  border-color: #fada39;
}

.device-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  object-fit: cover;
}

.device-info {
  flex: 1;
  margin-left: 16px;
  text-align: left;
}

.device-name {
  font-size: 18px;
  font-weight: normal;
  color: #787878;
  margin-bottom: 4px;
}

.device-name-selected {
  color: #fff;
}

.device-address {
  font-size: 14px;
  color: #787878;
}

.device-checked {
  width: 24px;
  height: 24px;
}

.loading-more,
.no-more {
  display: flex;
  justify-content: center;
  padding: 20px;
  color: #999;
  font-size: 14px;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 8px;
  padding: 8px 15px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.cancel-button {
  width: 100px;
  flex-shrink: 0;
  background: #323232;
  border-color: #323232;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 16px;
}

.confirm-button {
  flex: 1;
  border-radius: 16px;
  background: #fada39;
  border-color: #fada39;
}

.confirm-button-text {
  color: #000;
  font-size: 14px;
  font-weight: 600;
}
</style>
