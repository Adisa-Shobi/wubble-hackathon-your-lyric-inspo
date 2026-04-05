import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useMemo, useCallback } from 'react'
import * as storage from '../lib/storage'
import { getLyricsString } from '../lib/utils'
import type { Project } from '../types'
import BlockEditor from '../components/BlockEditor'
import WubbleChat from '../components/WubbleChat'
import AudioPlayer from '../components/AudioPlayer'

export const Route = createFileRoute('/project/$id')({
  component: Editor,
})

// ── Editor ─────────────────────────────────────────────────────────────────

function Editor() {
  const { id } = Route.useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(() => storage.getProject(id))
  const [editingTitle, setEditingTitle] = useState(false)

  const fullLyrics = useMemo(
    () => getLyricsString(project?.blocks ?? []),
    [project?.blocks],
  )

  // Synchronous save — no debounce, no spinner
  const save = useCallback((updated: Project) => {
    storage.saveProject(updated)
    setProject(updated)
  }, [])

  function update<K extends keyof Project>(key: K, value: Project[K]) {
    if (!project) return
    save({ ...project, [key]: value })
  }

  // ── Not found ─────────────────────────────────────────────
  if (!project) {
    return (
      <div className="min-h-screen bg-[var(--surface)] flex flex-col items-start justify-center px-16">
        <h1
          className="text-6xl uppercase tracking-tighter mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Not found
        </h1>
        <p className="font-bold uppercase text-sm mb-8" style={{ color: 'var(--fg-muted)' }}>
          This project doesn't exist on this device
        </p>
        <button
          className="btn-brutal bg-[var(--accent)] px-8 py-3"
          onClick={() => navigate({ to: '/' })}
        >
          ← Back to projects
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--surface)]">

      {/* ── Header ───────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 h-16 bg-[var(--surface-card)] flex items-center gap-4 px-6"
        style={{ borderBottom: 'var(--border)' }}
      >
        {/* Back */}
        <button
          className="btn-ghost p-2"
          onClick={() => navigate({ to: '/' })}
          aria-label="Back to projects"
          style={{ padding: '0.375rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
        </button>

        <div
          className="w-px h-6 bg-black opacity-20 flex-shrink-0"
        />

        {/* Title — click to edit */}
        {editingTitle ? (
          <input
            className="input-brutal flex-1 min-w-0 py-1"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              textTransform: 'uppercase',
            }}
            value={project.title}
            autoFocus
            spellCheck={false}
            onChange={(e) => update('title', e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
          />
        ) : (
          <button
            className="flex-1 min-w-0 text-left truncate font-black uppercase tracking-tighter hover:opacity-60 transition-opacity"
            style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}
            onClick={() => setEditingTitle(true)}
            title="Click to rename"
          >
            {project.title}
          </button>
        )}

        {/* Saved indicator */}
        <span
          className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest"
          style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}
        >
          ● SAVED
        </span>
      </header>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden grid grid-cols-[1fr_380px]">

        {/* Left — Lyric pad */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ borderRight: 'var(--border)' }}
        >
          {/* Panel label */}
          <div
            className="flex-shrink-0 flex items-center gap-3 px-6 py-3 bg-[var(--surface-card)]"
            style={{ borderBottom: 'var(--border)' }}
          >
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Lyric Pad
            </span>
            <span
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {project.blocks.length} {project.blocks.length === 1 ? 'block' : 'blocks'}
            </span>
          </div>

          {/* BlockEditor */}
          <div className="flex-1 overflow-hidden">
            <BlockEditor
              blocks={project.blocks}
              onChange={(blocks) => update('blocks', blocks)}
            />
          </div>
        </div>

        {/* Right — Tools */}
        <div className="flex flex-col overflow-hidden bg-[var(--surface-low)]">

          {/* Top — Wubble Chat */}
          <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{ borderBottom: 'var(--border)' }}
          >
            <div
              className="flex-shrink-0 flex items-center px-5 py-3 bg-[var(--surface-card)]"
              style={{ borderBottom: 'var(--border)' }}
            >
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Wubble Studio
              </span>
            </div>
            <WubbleChat
              fullLyrics={fullLyrics}
              initialMessages={project.messages ?? []}
              wubbleProjectId={project.wubbleProjectId}
              currentAudioUrl={project.audioUrl ?? null}
              onMessagesChange={(messages) => update('messages', messages)}
              onAudioUrl={(audioUrl) => update('audioUrl', audioUrl)}
              onWubbleProjectId={(wubbleProjectId) => update('wubbleProjectId', wubbleProjectId)}
            />
          </div>

          {/* Bottom — Song Analysis (Stage 8) */}
          <div className="h-64 flex flex-col overflow-hidden">
            <div
              className="flex-shrink-0 flex items-center px-5 py-3 bg-[var(--surface-card)]"
              style={{ borderBottom: 'var(--border)' }}
            >
              <span
                className="text-[10px] font-black uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Song Analysis
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center p-6">
              <p
                className="text-xs font-black uppercase opacity-30 text-center"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Analysis coming in Stage 8
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Audio Player ─────────────────────────────────────── */}
      {project.audioUrl && <AudioPlayer url={project.audioUrl} />}

      {/* ── Status bar ───────────────────────────────────────── */}
      <div className="status-bar flex-shrink-0">
        <span>LYRIC PAD</span>
        <span style={{ color: 'var(--fg-muted)' }}>—</span>
        <span>{project.title}</span>
        <span style={{ color: 'var(--fg-muted)' }}>—</span>
        <span>{project.blocks.length} BLOCKS</span>
        <span style={{ color: 'var(--fg-muted)' }}>—</span>
        <span>{fullLyrics.split(/\s+/).filter(Boolean).length} WORDS</span>
        <span className="ml-auto" style={{ color: 'var(--fg-muted)' }}>
          {new Date(project.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

    </div>
  )
}

