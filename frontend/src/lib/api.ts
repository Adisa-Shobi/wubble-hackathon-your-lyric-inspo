import { client } from './client'

export async function fetchSuggestions(lyrics: string) {
  const res = await client.api.suggest.$post({ json: { lyrics } })
  if (!res.ok) throw new Error('Failed to fetch suggestions')
  return res.json()
}

export async function fetchAnalysis(lyrics: string) {
  const res = await client.api.analyze.$post({ json: { lyrics } })
  if (!res.ok) throw new Error('Failed to fetch analysis')
  return res.json()
}

export async function startWubbleChat(
  message: string,
  lyrics?: string,
  projectId?: string,
) {
  const res = await client.api.chat.$post({
    json: { message, lyrics, project_id: projectId },
  })
  if (!res.ok) throw new Error('Failed to start Wubble chat')
  return res.json()
}

export async function pollWubble(requestId: string) {
  const res = await client.api.polling[':request_id'].$get({
    param: { request_id: requestId },
  })
  if (!res.ok) throw new Error('Polling failed')
  return res.json()
}
