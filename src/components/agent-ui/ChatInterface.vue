<template>
  <div class="chat-interface">
    <!-- 聊天消息列表 -->
    <div ref="messagesContainer" class="messages-list">
      <div
        v-for="record in chatRecords"
        :key="record.record_id"
        class="message-container"
        :class="{
          'user-message': record.role === 'user',
          'ai-message': record.role === 'assistant',
        }"
      >
        <!-- 用户消息 -->
        <template v-if="record.role === 'user'">
          <template v-if="record.type === 'text'">
            <div class="message-text user-text">{{ record.content }}</div>
          </template>
          <template v-else-if="record.type === 'images'">
            <div class="user-images-container">
              <img
                v-for="(imageUrl, index) in record.content"
                :key="index"
                :src="imageUrl"
                alt="user image"
                class="user-image-preview"
              />
            </div>
          </template>
        </template>

        <!-- AI 消息 -->
        <template v-else>
          <div
            v-for="toolCall in record.toolCallList"
            :key="toolCall.toolCallId"
            class="tool-call-container"
          >
            <div v-if="toolCall.callResult" class="call-result-container">
              <template v-if="toolCall.name === 'generateImage'">
                <div class="image-result" @click="handleImageTap(toolCall.callResult)">
                  <img :src="toolCall.callResult" alt="generated image" class="generated-image" />
                </div>
              </template>
              <template v-else>
                <div class="text-result">{{ toolCall.callResult }}</div>
              </template>
            </div>
            <div v-if="toolCall.error" class="error-message">{{ toolCall.error }}</div>
          </div>
          <div
            v-if="record.content"
            class="ai-content"
            v-html="
              renderMarkdown(
                typeof record.content === 'string'
                  ? record.content
                  : Array.isArray(record.content)
                    ? record.content.join('\n')
                    : '',
              )
            "
          ></div>
        </template>
      </div>

      <!-- AI 正在输入的消息 -->
      <div v-if="isAiTyping && aiTypingMessage" class="message-container ai-message">
        <div
          v-for="toolCall in aiTypingMessage.toolCallList"
          :key="toolCall.toolCallId"
          class="tool-call-container"
        >
          <div v-if="toolCall.content" class="typing-text">{{ toolCall.content }}</div>
          <div v-if="toolCall.callResult" class="call-result-container">
            <template v-if="toolCall.name === 'generateImage'">
              <div class="image-result" @click="handleImageTap(toolCall.callResult)">
                <img :src="toolCall.callResult" alt="generated image" class="generated-image" />
              </div>
            </template>
          </div>
          <div
            v-if="toolCall.name === 'generateImage' && !toolCall.callResult"
            class="loading-image-container"
            :class="{ blinking: isBlinking }"
          >
            <img src="@/assets/image-gender.png" alt="loading" class="loading-image" />
          </div>
        </div>
      </div>
    </div>

    <!-- 开场词区域 -->
    <div
      v-if="starterPrompts && starterPrompts.length > 0"
      class="starter-prompts-container"
      :class="{ hidden: chatRecords.length > 0 }"
    >
      <div class="starter-prompts-title">欢迎!我可以帮你生成各种图像, 你想从哪个开始?</div>
      <div
        v-for="(prompt, index) in starterPrompts"
        :key="index"
        class="starter-prompt-item"
        @click="handleStarterPrompt(prompt.action)"
      >
        {{ prompt.title }}
      </div>
    </div>

    <!-- 工具列表插槽 -->
    <div v-if="$slots['tools-list']" class="tools-list-slot">
      <slot name="tools-list" />
    </div>

    <!-- 底部输入框 -->
    <div class="input-container">
      <!-- 图片预览区域 -->
      <div v-if="uploadImages.length > 0" class="image-preview-container">
        <div v-for="(image, index) in uploadImages" :key="index" class="image-preview-item">
          <img :src="image" alt="preview" class="image-preview" />
          <div class="remove-image-button" @click="removeImage(index)">×</div>
        </div>
      </div>

      <!-- 文本输入框 -->
      <textarea
        v-model="inputText"
        class="text-input"
        placeholder="描述你要创作的内容"
        :maxlength="500"
        rows="1"
        @keydown.enter.exact.prevent="handleEnterKey"
        @input="handleInput"
      />

      <!-- 操作按钮区域 -->
      <div class="action-buttons-container">
        <!-- 图片上传按钮 -->
        <div class="image-upload-button" @click="handleUploadImage">
          <img src="@/assets/image-add.png" alt="add image" class="image-add-icon" />
        </div>

        <!-- 发送按钮 -->
        <div class="send-button" :class="{ disabled: !canSend }" @click="sendMessage">
          <img v-if="canSend" src="@/assets/send.png" alt="send" class="send-icon" />
          <img v-else src="@/assets/unsend.png" alt="unsend" class="send-icon" />
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import type { ChatRecord, ChatBody, ToolCall, GenerateImageOptions, ToolCallType } from './types'
import { MessageType, Role } from './types'

// 简单的 UUID 生成函数
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface Props {
  token: string
  apiUrl: string
  generateImageOptions: GenerateImageOptions
  starterPrompts?: { title: string; action: string }[]
  onChatRecordsChange?: (records: ChatRecord[]) => void
  onImageTap?: (imageUrl: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  starterPrompts: () => [],
})

const chatRecords = ref<ChatRecord[]>([])
const inputText = ref('')
const uploadImages = ref<string[]>([])
const isAiTyping = ref(false)
const aiTypingMessage = ref<ChatRecord | null>(null)
const currentAiMessageRef = ref('')
const isBlinking = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

let blinkTimer: number | null = null

const canSend = computed(() => {
  return (inputText.value.trim().length > 0 || uploadImages.value.length > 0) && !isAiTyping.value
})

const sendMessageByText = (text: string, images: string[] = []) => {
  const newRecords: ChatRecord[] = [
    {
      record_id: generateUUID(),
      content: text,
      toolCallList: [],
      role: Role.USER,
      type: 'text',
    },
  ]

  if (images.length > 0) {
    newRecords.unshift({
      record_id: generateUUID(),
      content: images,
      toolCallList: [],
      role: Role.USER,
      type: 'images',
    })
  }

  chatRecords.value = [...chatRecords.value, ...newRecords]

  const body: ChatBody = {
    id: generateUUID(),
    message: {
      id: generateUUID(),
      role: 'user',
      parts: [
        {
          type: 'text',
          text: text,
        },
      ],
    },
    selectedChatModel: 'chat-model',
    selectedVisibilityType: 'private',
    generateImageOptions: props.generateImageOptions,
  }

  if (images.length > 0) {
    body.message.parts.unshift({
      type: 'file',
      url: images,
      mediaType: 'image',
    })
  }

  startEventSource(body)
}

const sendMessage = () => {
  if (canSend.value) {
    const text = inputText.value.trim()
    const images = [...uploadImages.value]

    inputText.value = ''
    uploadImages.value = []

    sendMessageByText(text, images)
  }
}

const startEventSource = (body: ChatBody) => {
  // 关闭之前的连接（如果有的话）

  // 使用 fetch 处理流式响应（EventSource 不支持 POST）
  fetch(props.apiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${props.token}`,
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.body
    })
    .then((body) => {
      if (!body) {
        setIsAiTyping(false)
        return
      }

      const reader = body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const readStream = (): void => {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              setIsAiTyping(false)
              return
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // 保留最后一个不完整的行

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim()
                if (data === '[DONE]') {
                  setIsAiTyping(false)
                  return
                }

                if (data) {
                  try {
                    const parsed = JSON.parse(data)
                    handleEventData(parsed)
                  } catch {
                    // 忽略解析错误
                    console.warn('Failed to parse SSE data:', data)
                  }
                }
              }
            }
            readStream()
          })
          .catch((error) => {
            console.error('Stream read error:', error)
            setIsAiTyping(false)
          })
      }

      readStream()
    })
    .catch((error) => {
      console.error('Fetch error:', error)
      setIsAiTyping(false)
    })
}

interface EventData {
  type: string
  delta?: string
  toolCallId?: string
  toolName?: string
  inputTextDelta?: string
  input?: string | { prompt?: string }
  output?: string | { imageUrl?: string }
}

const handleEventData = (data: EventData) => {
  const { type, delta, toolCallId, toolName, inputTextDelta, input, output } = data
  console.log('handleEventData', data)
  switch (type) {
    case MessageType.START:
      setIsAiTyping(true)
      currentAiMessageRef.value = ''
      setAiTypingMessage({
        record_id: generateUUID(),
        content: '',
        toolCallList: [],
        role: Role.ASSISTANT,
      })
      break
    case MessageType.TEXT_DELTA:
      currentAiMessageRef.value += delta || ''
      setAiTypingMessage((prev) => {
        if (!prev) return null
        return {
          ...prev,
          content: prev.content + (delta || ''),
        }
      })
      break
    case MessageType.TOOL_INPUT_START:
      startBlinkAnimation()
      setAiTypingMessage((prev) => {
        if (!prev) return null
        const newToolCall: ToolCall = {
          toolCallId: toolCallId || '',
          content: '正在生图中...',
          name: (toolName as ToolCallType) || 'generateImage',
          callResult: null,
          error: null,
          callParams: '',
          rawParams: '',
          rawResult: '',
        }
        return {
          ...prev,
          toolCallList: [...prev.toolCallList, newToolCall],
        }
      })
      break
    case MessageType.TOOL_INPUT_DELTA:
      setAiTypingMessage((prev) => {
        if (!prev) return null
        const toolCallList = prev.toolCallList.map((tool) => {
          if (tool.toolCallId === toolCallId) {
            return {
              ...tool,
              callParams: tool.callParams + (inputTextDelta || ''),
            }
          }
          return tool
        })
        return {
          ...prev,
          toolCallList,
        }
      })
      break
    case MessageType.TOOL_INPUT_AVAILABLE:
      setAiTypingMessage((prev) => {
        if (!prev) return null
        const toolCallList = prev.toolCallList.map((tool) => {
          if (tool.toolCallId === toolCallId) {
            return {
              ...tool,
              callParams:
                (typeof input === 'object' && input?.prompt) ||
                (typeof input === 'string' ? input : '') ||
                '',
            }
          }
          return tool
        })
        return {
          ...prev,
          toolCallList,
        }
      })
      break
    case MessageType.TOOL_OUTPUT_AVAILABLE:
      stopBlinkAnimation()
      setAiTypingMessage((prev) => {
        if (!prev) return null
        const toolCallList = prev.toolCallList.map((tool) => {
          if (tool.toolCallId === toolCallId) {
            return {
              ...tool,
              callResult:
                (typeof output === 'object' && output?.imageUrl) ||
                (typeof output === 'string' ? output : '') ||
                '',
            }
          }
          return tool
        })
        return {
          ...prev,
          toolCallList,
        }
      })
      break
    case MessageType.TOOL_OUTPUT_ERROR:
      setAiTypingMessage((prev) => {
        if (!prev) return null
        const toolCallList = prev.toolCallList.map((tool) => {
          if (tool.toolCallId === toolCallId) {
            return {
              ...tool,
              error: '图像生成失败，请重新发送内容',
              content: '',
            }
          }
          return tool
        })
        return {
          ...prev,
          toolCallList,
        }
      })
      break
    case MessageType.FINISH:
      setIsAiTyping(false)
      setAiTypingMessage((prevAiMessage) => {
        if (!prevAiMessage) return null
        chatRecords.value = [...chatRecords.value, prevAiMessage]
        if (props.onChatRecordsChange) {
          nextTick(() => {
            props.onChatRecordsChange?.(chatRecords.value)
          })
        }
        return null
      })
      currentAiMessageRef.value = ''
      break
  }
}

const setIsAiTyping = (value: boolean) => {
  isAiTyping.value = value
}

const setAiTypingMessage = (
  message: ChatRecord | null | ((prev: ChatRecord | null) => ChatRecord | null),
) => {
  if (typeof message === 'function') {
    aiTypingMessage.value = message(aiTypingMessage.value)
  } else {
    aiTypingMessage.value = message
  }
}

const startBlinkAnimation = () => {
  isBlinking.value = true
  if (blinkTimer) {
    clearInterval(blinkTimer)
  }
  blinkTimer = window.setInterval(() => {
    isBlinking.value = !isBlinking.value
  }, 800)
}

const stopBlinkAnimation = () => {
  isBlinking.value = false
  if (blinkTimer) {
    clearInterval(blinkTimer)
    blinkTimer = null
  }
}

const handleImageTap = (imageUrl: string | null) => {
  if (imageUrl && props.onImageTap) {
    props.onImageTap(imageUrl)
  }
}

const handleUploadImage = () => {
  if (uploadImages.value.length >= 5) {
    alert('最多只能选择5张图片')
    return
  }
  fileInput.value?.click()
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files) return

  const remainingSlots = 5 - uploadImages.value.length
  const filesToAdd = Array.from(files).slice(0, remainingSlots)

  filesToAdd.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        uploadImages.value.push(result)
      }
    }
    reader.readAsDataURL(file)
  })

  if (files.length > remainingSlots) {
    alert(`最多只能选择5张图片，已添加${remainingSlots}张图片`)
  }

  // 重置 input
  target.value = ''
}

const removeImage = (index: number) => {
  uploadImages.value = uploadImages.value.filter((_, i) => i !== index)
}

const handleStarterPrompt = (prompt: string) => {
  sendMessageByText(prompt)
}

const handleEnterKey = (e: KeyboardEvent) => {
  if (e.shiftKey) {
    return // 允许换行
  }
  sendMessage()
}

const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = `${Math.min(target.scrollHeight, 100)}px`
}

const renderMarkdown = (content: string): string => {
  // 简单的 markdown 渲染（可以后续使用 marked 库增强）
  return content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
}

// 滚动到底部
watch(
  [chatRecords, aiTypingMessage],
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  },
  { deep: true },
)

onUnmounted(() => {
  if (blinkTimer) {
    clearInterval(blinkTimer)
  }
  stopBlinkAnimation()
})
</script>

<style scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: transparent;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  padding-bottom: 8px;
}

.message-container {
  margin: 4px 0;
  padding: 12px;
  border-radius: 16px;
}

.user-message {
  align-self: flex-end;
  background: #232323;
  padding: 12px 16px;
  width: fit-content;
  max-width: 90%;
  margin-left: auto;
}

.ai-message {
  align-self: flex-start;
  background: transparent;
  border-bottom-left-radius: 4px;
}

.user-text {
  color: white;
  font-size: 16px;
  line-height: 20px;
}

.user-images-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
}

.user-image-preview {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  background: #f0f0f0;
  object-fit: cover;
}

.ai-content {
  color: white;
  font-size: 16px;
  line-height: 20px;
}

.ai-content :deep(p) {
  margin: 0;
  color: white;
}

.ai-content :deep(code) {
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 14px;
}

.tool-call-container {
  margin: 8px 0;
}

.call-result-container {
  margin: 8px 0;
}

.image-result {
  cursor: pointer;
}

.generated-image {
  width: 160px;
  border-radius: 12px;
  max-width: 100%;
}

.text-result {
  color: white;
}

.error-message {
  color: #ff4444;
  font-size: 14px;
}

.typing-text {
  color: white;
  font-size: 16px;
}

.loading-image-container {
  background: #363636;
  border-radius: 12px;
  width: 160px;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.8s;
}

.loading-image-container.blinking {
  opacity: 0.3;
}

.loading-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.starter-prompts-container {
  padding: 12px 16px;
  transition:
    opacity 0.3s,
    height 0.3s,
    margin-bottom 0.3s;
  overflow: hidden;
}

.starter-prompts-container.hidden {
  opacity: 0;
  height: 0;
  margin-bottom: 0;
  padding: 0;
}

.starter-prompts-title {
  font-size: 18px;
  color: white;
  margin-bottom: 12px;
  font-weight: 400;
  line-height: 24px;
}

.starter-prompt-item {
  background: #232323;
  border-radius: 16px;
  padding: 12px 16px;
  margin-bottom: 12px;
  width: 100%;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;
}

.starter-prompt-item:hover {
  background: #2a2a2a;
}

.tools-list-slot {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 16px;
  padding-bottom: 8px;
}

.input-container {
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: #232323;
  border-radius: 16px;
  margin: 16px;
  margin-top: 0;
}

.image-preview-container {
  margin-bottom: 12px;
  max-height: 100px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 5px 0;
}

.image-preview-item {
  position: relative;
  flex-shrink: 0;
}

.image-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #f0f0f0;
  object-fit: cover;
}

.remove-image-button {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  z-index: 1;
}

.text-input {
  padding: 4px 0;
  font-size: 16px;
  max-height: 100px;
  margin-bottom: 12px;
  background: transparent;
  color: white;
  border: none;
  outline: none;
  resize: none;
  font-family: inherit;
}

.text-input::placeholder {
  color: #999;
}

.action-buttons-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-upload-button {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.send-button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.send-icon,
.image-add-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.send-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
