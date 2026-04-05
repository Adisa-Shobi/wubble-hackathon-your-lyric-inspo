import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import * as api from '../../lib/api'
import { queryKeys } from '../../lib/queryKeys'
import { escapeRegex } from '../../lib/utils'
import type { Block } from '../../types'

interface Suggestion {
  original: string
  suggestion: string
  rationale: string
}

interface Props {
  fullLyrics: string
  blocks: Block[]
  onBlocksChange: (blocks: Block[]) => void
}

export default function SuggestionOverlay({ fullLyrics, blocks, onBlocksChange }: Props) {
  const [debouncedLyrics, setDebouncedLyrics] = useState('')
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const suppressDebounce = useRef(false)

  useEffect(() => {
    if (!fullLyrics.trim()) {
      setDebouncedLyrics('')
      return
    }
    if (suppressDebounce.current) {
      suppressDebounce.current = false
      return
    }
    const t = setTimeout(() => setDebouncedLyrics(fullLyrics), 2_500)
    return () => clearTimeout(t)
  }, [fullLyrics])

  const { data } = useQuery({
    queryKey: queryKeys.suggestions(debouncedLyrics),
    queryFn: () => api.fetchSuggestions(debouncedLyrics),
    enabled: debouncedLyrics.trim().length > 0,
    staleTime: Infinity,
  })

  // Reset dismissed + open popover when fresh suggestions arrive
  useEffect(() => {
    setDismissed(new Set())
    setOpenIdx(null)
  }, [data])

  const active = (data ?? []).filter((s) => !dismissed.has(s.original))

  if (active.length === 0) return null

  function accept(s: Suggestion) {
    const re = new RegExp(`\\b${escapeRegex(s.original)}\\b`, 'i')
    let replaced = false
    const newBlocks = blocks.map((block) => {
      if (replaced || !re.test(block.content)) return block
      replaced = true
      return { ...block, content: block.content.replace(re, s.suggestion) }
    })
    suppressDebounce.current = true // block the debounce tick this change will trigger
    onBlocksChange(newBlocks)
    dismiss(s.original)
  }

  function dismiss(original: string) {
    setDismissed((prev) => new Set([...prev, original]))
    setOpenIdx(null)
  }

  const selected = openIdx !== null ? active[openIdx] : null

  return (
    <div className="flex-shrink-0 bg-[var(--surface-card)] animate-fade-in" style={{ borderBottom: 'var(--border)' }}>

      {/* Chips row */}
      <div className="flex items-center gap-2 px-4 py-2 flex-wrap">
        <span
          className="text-[9px] font-black uppercase tracking-widest flex-shrink-0"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}
        >
          Suggestions
        </span>
        {active.map((s, i) => (
          <button
            key={s.original}
            className="chip cursor-pointer transition-colors"
            style={{ backgroundColor: openIdx === i ? 'var(--accent)' : 'var(--surface-low)' }}
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
          >
            <s style={{ opacity: 0.5 }}>{s.original}</s>
            <span className="mx-1 opacity-40">→</span>
            {s.suggestion}
          </button>
        ))}
      </div>

      {/* Inline popover */}
      {selected && (
        <div className="px-4 pb-3 flex flex-col gap-2 animate-fade-in">
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-body)' }}
          >
            {selected.rationale}
          </p>
          <div className="flex gap-2">
            <button
              className="btn-brutal bg-[var(--accent)] px-4 py-1.5"
              onClick={() => accept(selected)}
            >
              Accept
            </button>
            <button
              className="btn-ghost px-4 py-1.5"
              onClick={() => dismiss(selected.original)}
            >
              Reject
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
