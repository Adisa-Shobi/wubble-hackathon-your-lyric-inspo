import type { Project } from '../types'
import { uuid } from './utils'

const PROJECTS_KEY = 'lyricpad:projects'
const DEVICE_ID_KEY = 'lyricpad:device-id'
const projectKey = (id: string) => `lyricpad:project:${id}`

// Module-level promise so concurrent calls don't trigger multiple fingerprint computations
let _deviceIdPromise: Promise<string> | null = null

export async function getDeviceId(): Promise<string> {
  const cached = localStorage.getItem(DEVICE_ID_KEY)
  if (cached) return cached

  if (!_deviceIdPromise) {
    _deviceIdPromise = (async () => {
      const FingerprintJS = await import('@fingerprintjs/fingerprintjs')
      const fp = await FingerprintJS.default.load()
      const result = await fp.get()
      localStorage.setItem(DEVICE_ID_KEY, result.visitorId)
      return result.visitorId
    })()
  }

  return _deviceIdPromise
}

export function getProjectIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function getProject(id: string): Project | null {
  try {
    const raw = localStorage.getItem(projectKey(id))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getProjects(): Project[] {
  return getProjectIds()
    .map(getProject)
    .filter((p): p is Project => p !== null)
}

export function saveProject(project: Project): void {
  const updated = { ...project, updatedAt: Date.now() }
  localStorage.setItem(projectKey(project.id), JSON.stringify(updated))

  const ids = getProjectIds()
  if (!ids.includes(project.id)) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify([project.id, ...ids]))
  }
}

export function deleteProject(id: string): void {
  localStorage.removeItem(projectKey(id))
  const ids = getProjectIds().filter((i) => i !== id)
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(ids))
}

export function createProject(title: string): Project {
  const now = Date.now()
  const project: Project = {
    id: uuid(),
    title,
    blocks: [],
    audioUrl: null,
    wubbleProjectId: null,
    createdAt: now,
    updatedAt: now,
  }
  saveProject(project)
  return project
}
