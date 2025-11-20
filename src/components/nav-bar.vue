<template>
  <div>
    <div class="nav-bar" :style="{ backgroundColor: bgColor }">
      <div class="nav-content">
        <div class="nav-left" @click="handleBack">
          <van-icon v-if="isBack" :name="iconName" size="20" color="white" class="back-icon" />
        </div>
        <div class="nav-title-wrapper">
          <div v-if="title" class="nav-title">{{ title }}</div>
          <div v-if="subTitle" class="nav-subtitle">( {{ subTitle }} )</div>
        </div>
        <div class="nav-right">
          <slot name="right"></slot>
        </div>
      </div>
    </div>
    <div class="nav-placeholder"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  isBack?: boolean
  title?: string
  subTitle?: string
  defaultBackBehavior?: boolean
  iconName?: string
}

const props = withDefaults(defineProps<Props>(), {
  isBack: false,
  title: 'WOWNOW',
  subTitle: '',
  defaultBackBehavior: true,
  iconName: 'arrow-left',
})

const emit = defineEmits<{
  back: []
}>()

const router = useRouter()
const bgColor = ref('transparent')

const handleBack = () => {
  if (props.defaultBackBehavior) {
    router.back()
  } else {
    emit('back')
  }
}

const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const newBgColor = scrollTop > 0 ? '#0D0D0D' : 'transparent'
  if (bgColor.value !== newBgColor) {
    bgColor.value = newBgColor
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.nav-bar {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  color: #fff;
  z-index: 999;
  transition: background-color 0.15s ease;
  height: 44px;
}

.nav-content {
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
  padding: 0 14px;
}

.nav-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;
}

.back-icon {
  flex-shrink: 0;
}

.nav-right {
  position: absolute;
  right: 14px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav-title-wrapper {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
  color: white;
}

.nav-title {
  font-size: 17px;
}

.nav-subtitle {
  font-size: 12px;
  margin-top: 2px;
}

.nav-placeholder {
  height: 44px;
}
</style>
