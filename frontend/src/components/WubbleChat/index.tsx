import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import * as api from '../../lib/api'
import { queryKeys } from '../../lib/queryKeys'
import { uuid } from '../../lib/utils'
import type { ChatMessage } from '../../types'

interface WubbleChatProps {
  fullLyrics: string
  initialMessages: ChatMessage[]
  wubbleProjectId: string | null
  currentAudioUrl: string | null
  onMessagesChange: (messages: ChatMessage[]) => void
  onAudioUrl: (url: string) => void
  onWubbleProjectId: (id: string) => void
}

export default function WubbleChat({
  fullLyrics,
  initialMessages,
  wubbleProjectId,
  currentAudioUrl,
  onMessagesChange,
  onAudioUrl,
  onWubbleProjectId,
}: WubbleChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [pollingActive, setPollingActive] = useState(false)
  const [lastSentLyrics, setLastSentLyrics] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const onMessagesChangeRef = useRef(onMessagesChange)
  useEffect(() => { onMessagesChangeRef.current = onMessagesChange })

  // Persist on every change, skip the initial hydration
  const isInitialized = useRef(false)
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true
      return
    }
    onMessagesChangeRef.current(messages)
  }, [messages])

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  function patchPending(patch: Partial<ChatMessage>) {
    setMessages((prev) =>
      prev.map((m) => (m.id === pendingId ? { ...m, ...patch } : m)),
    )
  }

  // ── Polling ──────────────────────────────────────────────────
  const pollQuery = useQuery({
    queryKey: queryKeys.wubble(requestId ?? ''),
    queryFn: () => api.pollWubble(requestId!),
    enabled: !!requestId && pollingActive,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'completed' || status === 'failed' ? false : 3_000
    },
  })

  useEffect(() => {
    const data = pollQuery.data
    if (!data || !pendingId || !pollingActive) return

    // Capture AI response text
    const responseText = data.results?.custom_data?.text
    if (responseText) patchPending({ modelResponse: responseText })

    if (data.status === 'completed') {
      setPollingActive(false)
      const finalUrl = data.streaming?.final_audio_url
      patchPending({ status: 'done', ...(finalUrl ? { audioUrl: finalUrl } : {}) })
      setPendingId(null)
    }

    if (data.status === 'failed') {
      setPollingActive(false)
      patchPending({ status: 'error' })
      setPendingId(null)
    }
  }, [pollQuery.data, pendingId, pollingActive])

  // ── Mutation ─────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: ({ message, lyrics }: { message: string; lyrics?: string }) =>
      api.startWubbleChat(message, lyrics, wubbleProjectId ?? undefined),
    onSuccess: (data) => {
      setRequestId(data.request_id)
      setPollingActive(true)
      onWubbleProjectId(data.project_id)
    },
    onError: () => {
      if (!pendingId) return
      patchPending({ status: 'error' })
      setPendingId(null)
    },
  })

  // ── Form ─────────────────────────────────────────────────────
  const form = useForm({
    defaultValues: { message: '' },
    onSubmit: async ({ value }) => {
      const text = value.message.trim()
      if (!text || isWorking) return

      const lyricsChanged = fullLyrics.trim() !== '' && fullLyrics !== lastSentLyrics
      const lyricsToSend = lyricsChanged ? fullLyrics : undefined
      if (lyricsChanged) setLastSentLyrics(fullLyrics)

      const assistantId = uuid()
      setMessages((prev) => [
        ...prev,
        { id: uuid(), role: 'user', text, lyricsIncluded: !!lyricsToSend },
        { id: assistantId, role: 'assistant', status: 'generating' },
      ])
      setPendingId(assistantId)
      mutation.mutate({ message: text, lyrics: lyricsToSend })
      form.reset()
    },
  })

  const isWorking = mutation.isPending || pollingActive

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">

      {/* ── Message history ──────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <EmptyHint />
        ) : (
          messages.map((msg) =>
            msg.role === 'user' ? (
              <UserMessage key={msg.id} text={msg.text!} lyricsIncluded={!!msg.lyricsIncluded} />
            ) : (
              <AssistantMessage
                key={msg.id}
                status={msg.status!}
                modelResponse={msg.modelResponse}
                songTitle={msg.songTitle}
                audioUrl={msg.audioUrl}
                isPlaying={!!msg.audioUrl && msg.audioUrl === currentAudioUrl}
                onPlay={onAudioUrl}
              />
            ),
          )
        )}
      </div>

      {/* ── Compose bar ──────────────────────────────────────── */}
      <div className="flex-shrink-0" style={{ borderTop: 'var(--border)' }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="flex"
        >
          <form.Field name="message">
            {(field) => (
              <input
                className="flex-1 bg-transparent outline-none font-bold px-4 py-3"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  opacity: isWorking ? 0.4 : 1,
                }}
                placeholder={isWorking ? 'Generating...' : 'Describe your sound...'}
                value={field.state.value}
                disabled={isWorking}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => field.handleChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    form.handleSubmit()
                  }
                }}
              />
            )}
          </form.Field>

          <button
            type="submit"
            disabled={isWorking}
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              borderLeft: 'var(--border)',
              width: '3rem',
              backgroundColor: isWorking ? 'var(--surface-high)' : 'var(--accent)',
              cursor: isWorking ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.08s ease',
            }}
            aria-label="Send"
          >
            <span
              className={`material-symbols-outlined ${isWorking ? 'animate-blink' : ''}`}
              style={{ fontSize: 18, pointerEvents: 'none' }}
            >
              {isWorking ? 'hourglass_empty' : 'send'}
            </span>
          </button>
        </form>
      </div>

    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function EmptyHint() {
  return (
    <div className="flex-1 flex flex-col justify-end pb-2 gap-1 opacity-30">
      <p
        className="text-[10px] font-black uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        Wubble Studio
      </p>
      <p className="text-xs font-bold uppercase">
        Describe your vibe, mood, or reference tracks
      </p>
      <p className="text-[10px] font-bold uppercase opacity-70">
        Lyrics are sent automatically when they change
      </p>
    </div>
  )
}

function UserMessage({ text, lyricsIncluded }: { text: string; lyricsIncluded: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-[9px] font-black uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}
      >
        You{lyricsIncluded ? ' · lyrics updated' : ''}
      </span>
      <div className="bg-[var(--surface-card)] px-3 py-2" style={{ border: 'var(--border)' }}>
        <p className="text-sm font-bold leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

function AssistantMessage({
  status,
  modelResponse,
  songTitle,
  audioUrl,
  isPlaying,
  onPlay,
}: {
  status: 'generating' | 'done' | 'error'
  modelResponse?: string
  songTitle?: string
  audioUrl?: string
  isPlaying: boolean
  onPlay: (url: string) => void
}) {
  const isGenerating = status === 'generating'
  const isError = status === 'error'

  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-[9px] font-black uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}
      >
        Wubble
      </span>
      <div
        style={{
          border: 'var(--border)',
          backgroundColor: status === 'done' ? 'var(--accent)' : isError ? 'var(--secondary)' : 'var(--surface-high)',
        }}
      >
        {/* Status row */}
        <div className="px-3 py-2 flex items-center justify-between gap-3">
          <p
            className={`text-[10px] font-black uppercase tracking-widest ${isGenerating ? 'animate-blink' : ''}`}
            style={{
              fontFamily: 'var(--font-mono)',
              color: isError ? 'white' : 'var(--fg)',
            }}
          >
            {isGenerating && '◉ Generating your track...'}
            {status === 'done' && (songTitle ? `✓ ${songTitle}` : '✓ Track ready')}
            {isError && '✕ Generation failed — try again'}
          </p>

          {audioUrl && (
            <button
              className="btn-brutal px-3 py-1 flex-shrink-0 flex items-center gap-1"
              style={{
                fontSize: '0.65rem',
                backgroundColor: isPlaying ? 'rgba(0,0,0,0.25)' : 'black',
                color: 'white',
                cursor: isPlaying ? 'default' : 'pointer',
              }}
              disabled={isPlaying}
              onClick={() => onPlay(audioUrl)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 12, pointerEvents: 'none' }}>
                {isPlaying ? 'volume_up' : 'play_arrow'}
              </span>
              {isPlaying ? 'PLAYING' : 'PLAY'}
            </button>
          )}
        </div>

        {/* Model response text — shown when available */}
        {modelResponse && (
          <div
            className="px-3 pb-3"
            style={{ borderTop: '1px solid rgba(0,0,0,0.12)' }}
          >
            <p
              className="text-xs leading-relaxed mt-2"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {modelResponse}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
