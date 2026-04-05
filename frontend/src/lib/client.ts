import type { AppType } from 'backend'
import { hc } from 'hono/client'
import { getDeviceId } from './storage'

// Single typed client instance — X-Device-ID injected on every request
export const client = hc<AppType>(import.meta.env.VITE_API_BASE ?? '/', {
  headers: async () => ({
    'X-Device-ID': await getDeviceId(),
  }),
})
