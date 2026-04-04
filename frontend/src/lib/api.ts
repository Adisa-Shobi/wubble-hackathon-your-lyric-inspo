import type { Suggestion, Analysis, WubblePollingResponse } from '../types'
import { getDeviceId } from './storage'

const BASE = import.meta.env.VITE_API_BASE ?? ''

async function headers(extra: Record<string, string> = {}): Promise<HeadersInit> {
  return {
    'Content-Type': 'application/json',
    'X-Device-ID': await getDeviceId(),
    ...extra,
  }
}

export async function fetchSuggestions(lyrics: string): Promise<Suggestion[]> {
  const res = await fetch(`${BASE}/api/suggest`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({ lyrics }),
  })
  if (!res.ok) throw new Error('Failed to fetch suggestions')
  return res.json()
}

export async function fetchAnalysis(lyrics: string): Promise<Analysis> {
  const res = await fetch(`${BASE}/api/analyze`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({ lyrics }),
  })
  if (!res.ok) throw new Error('Failed to fetch analysis')
  return res.json()
}

export async function startWubbleChat(
  prompt: string,
  vocals: boolean,
): Promise<{ request_id: string; project_id: string }> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({ prompt, vocals }),
  })
  if (!res.ok) throw new Error('Failed to start Wubble chat')
  return res.json()
}

export async function pollWubble(requestId: string): Promise<WubblePollingResponse> {
  const res = await fetch(`${BASE}/api/polling/${requestId}`, {
    headers: await headers({ 'Content-Type': '' }),
  })
  if (!res.ok) throw new Error('Polling failed')
  return res.json()
}
