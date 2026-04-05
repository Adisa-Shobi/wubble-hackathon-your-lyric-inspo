// ── App data model ────────────────────────────────────────────────────────────
// API response types are inferred from the backend AppType via Hono RPC.
// Only internal (localStorage) data model types live here.

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

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text?: string
  lyricsIncluded?: boolean
  status?: 'generating' | 'done' | 'error'
  modelResponse?: string
  songTitle?: string
  audioUrl?: string
}

export interface Project {
  id: string
  title: string
  blocks: Block[]
  messages: ChatMessage[]
  audioUrl: string | null
  wubbleProjectId: string | null
  createdAt: number
  updatedAt: number
}
