import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useForm } from '@tanstack/react-form'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import * as storage from '../lib/storage'
import { formatRelativeTime } from '../lib/utils'
import type { Project } from '../types'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

// ── Constants ──────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<Project>()

const CARD_ACCENTS = [
  '#CCFF00', '#FF6B6B', '#4ECDC4', '#FFD93D',
  '#C7B8EA', '#FD79A8', '#81ECEC', '#A8E6CF',
]

const MISALIGN = [
  '',
  'translateY(22px)',
  'rotate(-1.2deg)',
  'rotate(1.5deg) translateY(-10px)',
  'translateY(-14px)',
]

function cardAccent(id: string): string {
  const hash = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return CARD_ACCENTS[hash % CARD_ACCENTS.length]
}

// ── Dashboard ──────────────────────────────────────────────────────────────

function Dashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>(() => storage.getProjects())
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: true }])
  const [modalOpen, setModalOpen] = useState(false)

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', { id: 'title' }),
      columnHelper.accessor('updatedAt', { id: 'updatedAt', sortingFn: 'datetime' }),
    ],
    [],
  )

  const table = useReactTable({
    data: projects,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    storage.deleteProject(id)
    setProjects(storage.getProjects())
  }

  function handleCreate(title: string) {
    const project = storage.createProject(title)
    navigate({ to: '/project/$id', params: { id: project.id } })
  }

  const rows = table.getRowModel().rows

  return (
    <div className="min-h-screen bg-[var(--surface)]">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className="fixed top-0 w-full z-50 h-20 bg-white flex items-center justify-between px-4 md:px-8"
        style={{ borderBottom: 'var(--border)' }}
      >
        <h1
          className="text-xl md:text-2xl tracking-tighter uppercase italic"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Lyric Pad
        </h1>

        <button
          className="btn-brutal bg-[var(--accent)] text-sm px-6 py-3"
          onClick={() => setModalOpen(true)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          NEW SONG
        </button>
      </header>

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex fixed left-0 top-20 h-[calc(100vh-80px)] w-72 bg-[var(--surface-low)] z-40 flex-col p-6"
        style={{ borderRight: 'var(--border)' }}
      >
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-12 h-12 bg-black text-[var(--accent)] flex items-center justify-center flex-shrink-0"
            style={{ border: 'var(--border)' }}
          >
            <span className="material-symbols-outlined text-2xl">edit_note</span>
          </div>
          <div>
            <p className="text-sm uppercase leading-none" style={{ fontFamily: 'var(--font-display)' }}>
              Manuscripts
            </p>
            <p className="text-[10px] font-bold opacity-50 uppercase mt-0.5">Local device</p>
          </div>
        </div>

        <button
          className="btn-brutal bg-[var(--accent)] w-full py-3 text-sm mb-8"
          onClick={() => setModalOpen(true)}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          NEW SONG
        </button>

        <nav className="flex-1">
          <div
            className="flex items-center gap-3 font-bold uppercase text-sm p-3 bg-[var(--accent)]"
            style={{ border: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>history</span>
            RECENT
          </div>
        </nav>

        <div className="pt-6" style={{ borderTop: 'var(--border)' }}>
          <p className="text-[10px] font-black uppercase opacity-40">
            {projects.length} {projects.length === 1 ? 'song' : 'songs'} saved locally
          </p>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="ml-0 md:ml-72 pt-24 md:pt-32 pb-24 px-4 md:px-12 min-h-screen">

        {/* Page title + sort */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-16">
          <div>
            <h2
              className="text-4xl md:text-6xl tracking-tighter uppercase mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Projects
            </h2>
            <span className="inline-block bg-black text-white text-xs font-black uppercase px-2 py-1">
              Saved on this device
            </span>
          </div>

          <div
            className="flex items-center gap-2 bg-white px-4 py-2 self-start md:self-auto"
            style={{ border: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <span className="font-black text-xs uppercase">Sort:</span>
            <select
              className="bg-transparent font-bold uppercase text-xs focus:outline-none cursor-pointer"
              value={sorting[0]?.id === 'title' ? 'az' : 'recent'}
              onChange={(e) =>
                setSorting(
                  e.target.value === 'az'
                    ? [{ id: 'title', desc: false }]
                    : [{ id: 'updatedAt', desc: true }],
                )
              }
            >
              <option value="recent">RECENT</option>
              <option value="az">A–Z</option>
            </select>
          </div>
        </div>

        {/* Grid — extra padding so misaligned cards aren't clipped */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20"
          style={{ paddingBottom: '3rem' }}
        >
          {/* New Song card */}
          <div style={{ transform: MISALIGN[0] }}>
            <div
              className="card-brutal group bg-white flex flex-col h-[380px] cursor-pointer transition-colors hover:bg-[var(--accent)]"
              onClick={() => setModalOpen(true)}
              role="button"
              aria-label="Create new song"
            >
              {/* Same height header area as project cards */}
              <div
                className="h-48 flex items-center justify-center flex-shrink-0"
                style={{ borderBottom: 'var(--border)' }}
              >
                <div
                  className="w-16 h-16 flex items-center justify-center bg-[var(--surface)] group-hover:bg-white group-hover:scale-110 transition-all"
                  style={{ border: 'var(--border)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 36 }}>add</span>
                </div>
              </div>

              {/* Body — mirrors project card body */}
              <div className="p-6 flex flex-col flex-1">
                <h3
                  className="text-2xl uppercase mb-1"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  New Song
                </h3>
                <p className="text-[10px] font-black uppercase mb-6" style={{ color: 'var(--fg-muted)' }}>
                  Start writing...
                </p>
                <div className="mt-auto">
                  <button
                    className="btn-brutal bg-[var(--accent)] w-full py-3 text-sm"
                    onClick={() => setModalOpen(true)}
                  >
                    CREATE NEW →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Project cards */}
          {rows.map((row, i) => {
            const p = row.original
            const accent = cardAccent(p.id)
            const initial = p.title?.[0]?.toUpperCase() ?? '?'

            return (
              <div key={p.id} style={{ transform: MISALIGN[(i + 1) % MISALIGN.length] }}>
                <div
                  className="card-brutal group bg-white flex flex-col cursor-pointer h-[380px]"
                  onClick={() => navigate({ to: '/project/$id', params: { id: p.id } })}
                >
                  {/* Colour header */}
                  <div
                    className="h-48 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: accent, borderBottom: 'var(--border)' }}
                  >
                    <span
                      className="select-none leading-none opacity-[0.15]"
                      style={{ fontFamily: 'var(--font-display)', fontSize: '8rem' }}
                    >
                      {initial}
                    </span>

                    {/* Delete */}
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      className="btn-destructive absolute top-3 right-3 w-9 h-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete project"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3
                      className="text-2xl leading-tight uppercase mb-1 line-clamp-2"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {p.title}
                    </h3>
                    <p className="text-[10px] font-black uppercase opacity-50 mb-6">
                      {formatRelativeTime(p.updatedAt)}
                    </p>

                    <div className="mt-auto">
                      <button
                        className="btn-brutal bg-[var(--accent)] w-full py-3 text-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate({ to: '/project/$id', params: { id: p.id } })
                        }}
                      >
                        OPEN EDITOR
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {rows.length === 0 && (
          <div className="py-12">
            <p
              className="text-2xl uppercase opacity-25 mb-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              No songs yet
            </p>
            <p className="text-sm font-bold uppercase opacity-25">
              Hit "NEW SONG" to start writing
            </p>
          </div>
        )}
      </main>

      {/* ── New Song Modal ──────────────────────────────────────── */}
      {modalOpen && (
        <NewSongModal
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}

// ── NewSongModal ───────────────────────────────────────────────────────────

function NewSongModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (title: string) => void
}) {
  const form = useForm({
    defaultValues: { title: '' },
    onSubmit: async ({ value }) => {
      if (value.title.trim()) onCreate(value.title.trim())
    },
  })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative bg-white w-full max-w-md mx-4 p-8"
        style={{ border: 'var(--border)', boxShadow: 'var(--shadow-lg)' }}
      >
        <h2
          className="text-4xl uppercase tracking-tighter mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          New Song
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="title"
            validators={{ onChange: ({ value }) => (!value.trim() ? 'Title required' : undefined) }}
          >
            {(field) => (
              <div className="mb-6">
                <label
                  htmlFor="song-title"
                  className="block text-xs font-black uppercase mb-2"
                >
                  Title
                </label>
                <input
                  id="song-title"
                  type="text"
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="UNTITLED SONG"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="input-brutal"
                  style={{ fontSize: 18 }}
                />
              </div>
            )}
          </form.Field>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={form.state.isSubmitting}
              className="btn-brutal bg-[var(--accent)] flex-1 py-3 text-sm"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              {form.state.isSubmitting ? 'CREATING...' : 'CREATE →'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost py-3 px-6"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
