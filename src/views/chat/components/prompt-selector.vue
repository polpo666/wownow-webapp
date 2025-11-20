<template>
  <div class="prompt-button" :class="{ disabled: disabled }" @click="handlePress">
    <img
      src="@/assets/prompt.png"
      alt="prompt"
      class="prompt-icon"
      :style="{ opacity: disabled ? 0.5 : 1 }"
    />
    <span :style="{ color: disabled ? '#999999' : '#ffffff' }">
      提示词
      <span v-if="selectedCount > 0"> ({{ selectedCount }})</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  disabled?: boolean
  selectedCount?: number
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  selectedCount: 0,
})

const router = useRouter()

const handlePress = () => {
  if (disabled) return
  router.push('/create/prompt')
}
</script>

<style scoped>
.prompt-button {
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px 6px;
  gap: 8px;
  border: 1px solid #575757;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-start;
}

.prompt-button:not(.disabled):hover {
  background: rgba(255, 255, 255, 0.1);
}

.prompt-button.disabled {
  border-color: #333333;
  cursor: not-allowed;
}

.prompt-icon {
  width: 12px;
  height: 12px;
}
</style>
