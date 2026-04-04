import type { Block } from '../types'

export function getLyricsString(blocks: Block[]): string {
  return blocks
    .filter((b) => b.content.trim())
    .map((b) => `[${b.type.toUpperCase()}]\n${b.content}`)
    .join('\n\n')
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function uuid(): string {
  return crypto.randomUUID()
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return rtf.format(-minutes, 'minute')

  const hours = Math.floor(diff / 3_600_000)
  if (hours < 24) return rtf.format(-hours, 'hour')

  const days = Math.floor(diff / 86_400_000)
  return rtf.format(-days, 'day')
}
