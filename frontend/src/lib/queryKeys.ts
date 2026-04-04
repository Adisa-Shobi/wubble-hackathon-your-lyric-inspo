export const queryKeys = {
  suggestions: (lyrics: string) => ['suggestions', lyrics] as const,
  analysis: (lyrics: string) => ['analysis', lyrics] as const,
  wubble: (requestId: string) => ['wubble', requestId] as const,
}
