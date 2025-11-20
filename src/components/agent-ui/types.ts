export interface GenerateImageOptions {
  templateId?: number
  defaultPrompt?: string // 品类预置提示词
  stylePrompt?: string // 风格提示词
  templatePrompt?: string // 模板提示词
  negativePrompt?: string
  placeholderUrl?: string
  width: number
  height: number
  productType?: string // 产品类型
  ratio?: string // 宽高比，格式为 "x/x"，例如 "16/9"
}

export interface ChatRecord {
  record_id: string
  content: string | string[]
  toolCallList: ToolCall[]
  role: 'user' | 'assistant'
  type?: 'text' | 'images'
}

export type ToolCallType =
  | 'generateImage'
  | 'generateText'
  | 'generateAudio'
  | 'generateVideo'
  | 'generateDocument'
  | 'generateSpreadsheet'
  | 'generatePresentation'
  | 'generateCode'

export interface ToolCall {
  toolCallId: string
  content: string
  name: ToolCallType
  callResult: string | null
  error: string | null
  callParams: string | null
  rawParams: string
  rawResult: string
}

export enum MessageType {
  START = 'start',
  START_STEP = 'start-step',
  TEXT_STARTING = 'text-start',
  TEXT_DELTA = 'text-delta',
  TOOL_INPUT_START = 'tool-input-start',
  TOOL_INPUT_DELTA = 'tool-input-delta',
  TOOL_INPUT_AVAILABLE = 'tool-input-available',
  TOOL_OUTPUT_AVAILABLE = 'tool-output-available',
  TOOL_OUTPUT_ERROR = 'tool-output-error',
  FINISH_STEP = 'finish-step',
  FINISH = 'finish',
}

export interface ChatInterfaceProps {
  token: string
  apiUrl: string
  generateImageOptions: GenerateImageOptions
  starterPrompts?: { title: string; action: string }[]
  onChatRecordsChange?: (records: ChatRecord[]) => void
  onImageTap?: (imageUrl: string) => void
}

export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface ChatBody {
  id: string
  message: {
    id: string
    role: string
    parts: MessagePart[]
  }
  selectedChatModel: string
  selectedVisibilityType: string
  generateImageOptions: GenerateImageOptions
}

export interface MessagePart {
  type: string
  text?: string
  url?: string[]
  mediaType?: string
}
