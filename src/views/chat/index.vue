<template>
  <div class="chat-page">
    <nav-bar
      title="新建创作"
      :sub-title="subTitle"
      :is-back="true"
      :default-back-behavior="false"
      @back="onBack"
    >
      <template #right>
        <van-button
          :disabled="!canProduce || isOrdering"
          class="order-button"
          size="small"
          @click="handleOrderProduction"
        >
          {{ isOrdering ? '下单中...' : '下单生产' }}
        </van-button>
      </template>
    </nav-bar>

    <div class="chat-content">
      <chat-interface
        :token="token || ''"
        :api-url="apiUrl"
        :generate-image-options="generateImageOptions"
        :starter-prompts="starterPrompts"
        @chat-records-change="handleChatRecordsChange"
        @image-tap="handleImageTap"
      >
        <template #tools-list>
          <div class="tools-list">
            <style-selector :on-style-change="handleStyleChange" />
            <prompt-selector :selected-count="prompts.length" />
            <category-selector :selected-name="chatTemplate?.label" />
          </div>
        </template>
      </chat-interface>
    </div>

    <!-- 图片预览组件 -->
    <viewer :show="showViewer" :src="viewerImageSrc" @back="onViewerBack" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useProduceStore } from '@/stores/produce'
import { ChatInterface } from '@/components/agent-ui'
import type { ChatRecord } from '@/components/agent-ui'
import type { GenerateImageOptions } from '@/components/agent-ui'
import { COIN_NEGATIVE_PROMPT, WOWNOW_CHAT_URL } from '@/lib/constants'
import { TemplateLabel } from '@/types/template'
import { OrientationType } from '@/types/asset'
import NavBar from '@/components/nav-bar.vue'
import { showFailToast } from 'vant'
import Viewer from './components/viewer.vue'
import CategorySelector from './components/category-selector.vue'
import PromptSelector from './components/prompt-selector.vue'
import StyleSelector from './components/style-selector.vue'
import type { WownowPromptStyle } from '@/types/template'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const produceStore = useProduceStore()

const token = computed(() => authStore.token)
const chatTemplate = computed(() => chatStore.chatTemplate)
const promptStyle = computed(() => chatStore.promptStyle)
const prompts = computed(() => chatStore.prompts)
const outputList = computed(() => chatStore.outputList)

const isOrdering = ref(false)
const apiUrl = WOWNOW_CHAT_URL + '/v1/chat'
const showViewer = ref(false)
const viewerImageSrc = ref('')

// 判断是否可以下单生产（必须有AI生成的图片）
const canProduce = computed(() => {
  return outputList.value.some((item) => item.imageUrl && item.imageUrl.trim() !== '')
})

// 构建 subTitle: (chatTemplate.name、chatTemplate.craftType)
const subTitle = computed(() => {
  const name = chatTemplate.value?.name || ''
  const craftType = chatTemplate.value?.craftType || ''

  if (name && craftType) {
    return `(${name}、${craftType})`
  } else if (name) {
    return `(${name})`
  } else if (craftType) {
    return `(${craftType})`
  }
  return ''
})

// 根据 chatTemplate 计算 generateImageOptions
const generateImageOptions = computed((): GenerateImageOptions => {
  if (!chatTemplate.value) {
    // 如果没有模板，返回默认值
    return {
      width: 1024,
      height: 1024,
      stylePrompt: '',
      negativePrompt: '',
    }
  }

  // 根据 label 判断是否需要 negativePrompt
  const negativePrompt =
    chatTemplate.value.label === TemplateLabel.FlatCoin ||
    chatTemplate.value.label === TemplateLabel.ReliefCoin
      ? COIN_NEGATIVE_PROMPT
      : ''

  // 根据 orientation 计算宽高（横屏时交换宽高）
  // 默认宽高，可以根据实际需求调整
  let width = 1024
  let height = 1024

  // 根据 orientation 调整宽高
  if (chatTemplate.value.orientation === OrientationType.LANDSCAPE) {
    width = 1024
    height = 768
  } else {
    width = 768
    height = 1024
  }

  const options: GenerateImageOptions = {
    templateId: chatTemplate.value.id,
    defaultPrompt: chatTemplate.value.prompt,
    productType: chatTemplate.value.label,
    width,
    height,
    stylePrompt: promptStyle.value?.prompt || '',
    negativePrompt,
    ratio: chatTemplate.value.aspectRatio,
  }
  return options
})

// 开场提示词
const starterPrompts = [
  { title: '画一只可爱的动物', action: '画一只可爱的动物' },
  {
    title: '帮我生成一张贝加尔湖畔风景的油画',
    action: '帮我生成一张贝加尔湖畔风景的油画',
  },
  {
    title: '穿黄色连衣裙的少女在花园抓蝴蝶， 背景是晴天午后',
    action: '穿黄色连衣裙的少女在花园抓蝴蝶， 背景是晴天午后',
  },
]

// 处理聊天记录变化
const handleChatRecordsChange = (records: ChatRecord[]) => {
  const assistantOutputs = records
    .filter((record) => record.role === 'assistant')
    .flatMap((record) =>
      record.toolCallList
        .filter((tool) => tool.name === 'generateImage' && tool.callResult)
        .map((tool) => ({
          id: `${record.record_id}-${tool.toolCallId}`,
          content:
            typeof record.content === 'string'
              ? record.content
              : Array.isArray(record.content)
                ? record.content.join('\n')
                : '',
          imageUrl: tool.callResult || '',
          styleId: null,
        })),
    )
    .filter((item) => item.imageUrl)

  chatStore.setOutputList(assistantOutputs)
  chatStore.setChatRecord(records)
}

// 处理图片点击
const handleImageTap = (imageUrl: string) => {
  viewerImageSrc.value = imageUrl
  showViewer.value = true
}

// 关闭预览
const onViewerBack = () => {
  showViewer.value = false
}

// 处理下单生产
const handleOrderProduction = async () => {
  if (!canProduce.value) {
    showFailToast('请先生成内容')
    return
  }

  if (outputList.value.length === 0) {
    showFailToast('请先生成内容')
    return
  }

  // 获取最新的输出内容
  const latestOutput = outputList.value[outputList.value.length - 1]

  if (!latestOutput || !latestOutput.imageUrl) {
    showFailToast('请先生成内容')
    return
  }

  // 设置产品图片
  produceStore.setProductImageUrl(latestOutput.imageUrl)
  produceStore.setChatTemplate(chatTemplate.value)
  // 设置默认价格
  const firstOption = chatTemplate.value?.processOptions?.[0]
  if (firstOption) {
    produceStore.setPrice(firstOption.price || 0.01)
    produceStore.setDiscountedPrice(firstOption.discountedPrice)
  }
  produceStore.setAssetId(null)

  // 跳转到设备选择页面
  router.push('/produce')
}

// 处理风格变化
const handleStyleChange = (style: WownowPromptStyle) => {
  console.log('选择风格:', style.name)
  // 可以在这里添加额外的处理逻辑
}

// 返回
const onBack = () => {
  router.back()
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0d0d0d;
  color: #fff;
}

.chat-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.order-button {
  background: #fada39;
  border-color: #fada39;
  color: #000;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 10px;
  height: auto;
}

.order-button:disabled {
  background: #ccc !important;
  border-color: #ccc !important;
  color: #999 !important;
}

.order-button :deep(.van-button__text) {
  color: inherit;
}

.tools-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 8px;
  position: relative;
}
</style>
