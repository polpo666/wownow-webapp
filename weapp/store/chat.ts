import { defineStore } from "@mpxjs/pinia";
import { getPromptStyleDetail } from "@/api/template";
import type { Attachment, WownowPromptStyle, WownowTemplate } from "@/types";

export interface ChatOutput {
  id: string;
  content: string;
  imageUrl: string;
  styleId: number | null;
}

interface ChatStoreState {
  category: any;
  prompts: any[];
  chatTemplate: WownowTemplate | null;
  promptStyle: WownowPromptStyle | null;
  templatePrompt: WownowPromptStyle | null;
  attachment: Attachment | null;
  outputList: ChatOutput[];
  chatRecords: [];
  assetStyleId: number | null;
}

export const useChatStore = defineStore("chat", {
  state: (): ChatStoreState => ({
    category: null,
    prompts: [],
    // 聊天相关状态
    chatTemplate: null,
    promptStyle: null,
    templatePrompt: null,
    attachment: null,
    outputList: [],
    chatRecords: [],
    assetStyleId: null,
  }),
  getters: {
    hasChatTemplate(state) {
      return !!state.chatTemplate;
    },
    hasOutput(state) {
      return state.outputList.length > 0;
    },
  },
  actions: {
    setPrompts(prompts: any[]) {
      this.prompts = prompts;
    },
    setChatRecord(chatRecord: []) {
      this.chatRecords = chatRecord;
    },
    setCategory(category: any) {
      this.category = category;
    },
    // 设置聊天模板
    setChatTemplate(template: WownowTemplate | null) {
      this.chatTemplate = template;
    },
    // 设置提示风格
    setPromptStyle(style: WownowPromptStyle | null) {
      this.promptStyle = style;
    },
    // 设置提示模板
    setTemplatePrompt(prompt: WownowPromptStyle | null) {
      this.templatePrompt = prompt;
    },
    // 设置附件
    setAttachment(attachment: Attachment | null) {
      this.attachment = attachment;
    },
    // 设置输出列表
    setOutputList(list: ChatOutput[]) {
      this.outputList = list;
    },
    setAssetStyleId(styleId: number | null) {
      this.assetStyleId = styleId;
    },
    // 重置聊天状态
    resetChatStore() {
      this.chatTemplate = null;
      this.promptStyle = null;
      this.attachment = null;
      this.outputList = [];
      this.prompts = [];
      this.chatRecords = [];
      this.category = null;
      this.assetStyleId = null;
    },
  },
});
