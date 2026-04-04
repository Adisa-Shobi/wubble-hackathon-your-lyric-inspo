export type BlockType =
  | 'verse'
  | 'hook'
  | 'chorus'
  | 'bridge'
  | 'outro'
  | 'refrain'
  | 'pre-chorus'
  | 'intro'
  | 'interlude'

export const UI_BLOCK_TYPES = ['verse', 'hook', 'chorus', 'bridge', 'outro'] as const satisfies BlockType[]

export interface Block {
  id: string
  type: BlockType
  content: string
  sequence: number
}

export interface Project {
  id: string
  title: string
  blocks: Block[]
  audioUrl: string | null
  wubbleProjectId: string | null
  createdAt: number
  updatedAt: number
}

export interface Suggestion {
  original: string
  suggestion: string
  rationale: string
}

export interface Analysis {
  vibe: string
  impact: string
  status_quo: string
}

export interface WubblePollingResponse {
  request_id: string
  status: 'processing' | 'generating' | 'completed' | 'error'
  message?: string
  results?: {
    custom_data?: { text: string }
    streaming: boolean
  }
  audio_url?: string | null
  retry_after?: number
}

// Raw shapes returned by the backend (before normalization)
export interface ApiProject {
  id: string
  title: string
  audio_url: string | null
  wubble_project_id: string | null
  created_at: string
  updated_at: string
  blocks?: ApiBlock[]
}

export interface ApiBlock {
  id: string
  project_id: string
  type: BlockType
  content: string
  sequence: number
}
