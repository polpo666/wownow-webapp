<template>
  <div class="nfc-agent-page">
    <div class="bg-cover"></div>
    <nav-bar title="智能体商店" :is-back="true" />

    <div class="content-wrapper">
      <div class="agent-grid">
        <div
          v-for="agent in agentList"
          :key="agent.id"
          class="agent-card"
          :class="{ selected: selectedAgent?.id === agent.id }"
          @click="toggleAgentItem(agent)"
        >
          <img
            v-if="agent.coverUrl && !agent.coverUrlError"
            :src="agent.coverUrl"
            class="agent-cover"
            alt="agent"
            @error="handleImageError(agent.id)"
          />
          <div v-else class="agent-placeholder">
            <img src="@/assets/svgs/icon-nfc-agent.svg" class="placeholder-icon" alt="agent" />
          </div>

          <div class="agent-info">
            <div class="agent-name">{{ agent.name }}</div>
            <van-button
              plain
              block
              class="detail-button"
              color="#0D0D0D"
              @click.stop="navigateToDetail(agent)"
            >
              详情
            </van-button>
          </div>

          <img
            v-if="selectedAgent?.id === agent.id"
            src="@/assets/svgs/icon-checked-fill.svg"
            class="checked-icon"
            alt="checked"
          />

          <div v-if="selectedAgent && selectedAgent.id !== agent.id" class="agent-overlay"></div>
        </div>
      </div>
    </div>

    <div class="bottom-actions">
      <van-button
        block
        type="primary"
        color="#FADA39"
        :disabled="!selectedAgent"
        :class="{ disabled: !selectedAgent }"
        @click="handleComplete"
      >
        选择
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProduceStore, type NFCAgent } from '@/stores/produce'
import { getNfcAgentList } from '@/api/nfc'
import { showFailToast } from 'vant'
import NavBar from '@/components/nav-bar.vue'

const router = useRouter()
const produceStore = useProduceStore()

const agentList = ref<NFCAgent[]>([])
const selectedAgent = ref<NFCAgent | null>(null)

// 从 store 中恢复选中的智能体
onMounted(async () => {
  await fetchNfcAgentList()

  if (produceStore.nfcContent && produceStore.nfcContent.agent) {
    selectedAgent.value = produceStore.nfcContent.agent
  }
})

const fetchNfcAgentList = async () => {
  try {
    const res = await getNfcAgentList()
    if (res.code === 0 && res.data) {
      agentList.value = res.data.list
    } else {
      showFailToast(res.message || '获取智能体列表失败')
    }
  } catch (err) {
    console.error('获取智能体列表失败:', err)
    showFailToast('获取智能体列表失败')
  }
}

const toggleAgentItem = (agent: NFCAgent) => {
  selectedAgent.value = selectedAgent.value?.id === agent.id ? null : agent
}

const handleImageError = (agentId: string) => {
  const agent = agentList.value.find((a) => a.id === agentId)
  if (agent) {
    agent.coverUrlError = true
  }
}

const navigateToDetail = (agent: NFCAgent) => {
  // TODO: 实现详情页面
  showFailToast('详情功能开发中')
}

const handleComplete = () => {
  if (!selectedAgent.value) return

  const agent = selectedAgent.value

  // 处理特殊逻辑（如情绪电台）
  if (agent.name.includes('情绪电台') && agent.metadata) {
    // TODO: 实现情绪电台弹窗
    showFailToast('情绪电台功能开发中')
    return
  }

  produceStore.setNfcContent({
    type: 'agent',
    link: agent.url || '',
    text: '',
    attachments: [],
    agent: agent,
  })

  router.back()
}
</script>

<style scoped>
.nfc-agent-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
  color: #fff;
}

.bg-cover {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/bg-chat.png');
  background-size: cover;
  background-position: center;
  z-index: -1;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.agent-card {
  height: 222px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: radial-gradient(
    52.98% 50% at 50% 50%,
    rgba(79, 79, 79, 1) 0%,
    rgba(33, 33, 33, 1) 100%
  );
  cursor: pointer;
}

.agent-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.agent-placeholder {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  opacity: 0.6;
}

.placeholder-icon {
  width: 100%;
  height: 100%;
}

.agent-info {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 8px;
}

.agent-name {
  color: #0d0d0d;
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;
}

.detail-button {
  height: 31px;
  border-radius: 51px;
  font-size: 16px;
  font-weight: 500;
  background: transparent;
}

.checked-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  z-index: 10;
}

.agent-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 5;
}

.bottom-actions {
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
}

.bottom-actions :deep(.van-button) {
  border-radius: 16px;
}

.bottom-actions :deep(.van-button--disabled) {
  background: #7a7a7a !important;
  border-color: #7a7a7a !important;
  color: #a6a6a6 !important;
  opacity: 1;
}
</style>
