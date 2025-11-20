import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { WownowTemplate, WownowPromptStyle } from '@/types/template'

export interface ChatOutput {
  id: string
  content: string
  imageUrl: string
  styleId: number | null
}

export interface Attachment {
  name: string
  url: string
  contentType: string
}

export interface CategoryWithTemplates {
  category: {
    id: number
    name: string
    coverUrl?: string
  }
  subCategories: Array<{
    templates: WownowTemplate
    category: {
      id: number
      name: string
    }
  }>
}

export const useChatStore = defineStore('chat', () => {
  const category = ref<CategoryWithTemplates | null>(null)
  const prompts = ref<any[]>([])
  const chatTemplate = ref<WownowTemplate | null>(null)
  const promptStyle = ref<WownowPromptStyle | null>(null)
  const templatePrompt = ref<WownowPromptStyle | null>(null)
  const attachment = ref<Attachment | null>(null)
  const outputList = ref<ChatOutput[]>([])
  const chatRecords = ref<any[]>([])
  const assetStyleId = ref<number | null>(null)

  const hasChatTemplate = computed(() => !!chatTemplate.value)
  const hasOutput = computed(() => outputList.value.length > 0)

  function setPrompts(promptsList: any[]) {
    prompts.value = promptsList
  }

  function setChatRecord(chatRecord: any[]) {
    chatRecords.value = chatRecord
  }

  function setCategory(categoryData: CategoryWithTemplates | null) {
    category.value = categoryData
  }

  function setChatTemplate(template: WownowTemplate | null) {
    chatTemplate.value = template
  }

  function setPromptStyle(style: WownowPromptStyle | null) {
    promptStyle.value = style
  }

  function setTemplatePrompt(prompt: WownowPromptStyle | null) {
    templatePrompt.value = prompt
  }

  function setAttachment(attach: Attachment | null) {
    attachment.value = attach
  }

  function setOutputList(list: ChatOutput[]) {
    outputList.value = list
  }

  function setAssetStyleId(styleId: number | null) {
    assetStyleId.value = styleId
  }

  function resetChatStore() {
    chatTemplate.value = null
    promptStyle.value = null
    attachment.value = null
    outputList.value = []
    prompts.value = []
    chatRecords.value = []
    category.value = null
    assetStyleId.value = null
  }

  return {
    // state
    category,
    prompts,
    chatTemplate,
    promptStyle,
    templatePrompt,
    attachment,
    outputList,
    chatRecords,
    assetStyleId,
    // getters
    hasChatTemplate,
    hasOutput,
    // actions
    setPrompts,
    setChatRecord,
    setCategory,
    setChatTemplate,
    setPromptStyle,
    setTemplatePrompt,
    setAttachment,
    setOutputList,
    setAssetStyleId,
    resetChatStore,
  }
})
