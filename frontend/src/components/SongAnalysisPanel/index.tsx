import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import * as api from '../../lib/api'
import { queryKeys } from '../../lib/queryKeys'

interface Props {
  fullLyrics: string
}

export default function SongAnalysisPanel({ fullLyrics }: Props) {
  const [queriedLyrics, setQueriedLyrics] = useState<string | null>(null)
  const hasLyrics = fullLyrics.trim().length > 0

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.analysis(queriedLyrics ?? ''),
    queryFn: () => api.fetchAnalysis(queriedLyrics!),
    enabled: !!queriedLyrics?.trim(),
    staleTime: Infinity,
    retry: 1,
  })

  function handleAnalyse() {
    if (queriedLyrics === fullLyrics) {
      refetch()
    } else {
      setQueriedLyrics(fullLyrics)
    }
  }

  return (
    <div className="h-64 flex flex-col overflow-hidden">

      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-[var(--surface-card)]"
        style={{ borderBottom: 'var(--border)' }}
      >
        <span
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Song Analysis
        </span>
        {data && (
          <div className="flex items-center gap-2">
            {isError && !isFetching && (
              <span
                className="text-[9px] font-black uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--secondary)' }}
              >
                Failed
              </span>
            )}
            <button
              className="btn-ghost p-0 flex items-center justify-center"
              style={{ width: '1.75rem', height: '1.75rem', boxShadow: 'none' }}
              onClick={handleAnalyse}
              disabled={isFetching}
              aria-label="Refresh analysis"
            >
              <span
                className={`material-symbols-outlined ${isFetching ? 'animate-spin-slow' : ''}`}
                style={{ fontSize: 14 }}
              >
                refresh
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {!hasLyrics ? (
          <Hint text="Write some lyrics to get analysis" />
        ) : isFetching ? (
          <ShimmerCards />
        ) : data ? (
          <AnalysisCards data={data} />
        ) : (
          <AnalysePrompt onAnalyse={handleAnalyse} isError={isError} />
        )}
      </div>

    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function AnalysePrompt({ onAnalyse, isError }: { onAnalyse: () => void; isError: boolean }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 p-6">
      {isError && (
        <p
          className="text-[9px] font-black uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--secondary)' }}
        >
          Analysis failed
        </p>
      )}
      <button className="btn-brutal bg-[var(--accent)] px-6 py-2" onClick={onAnalyse}>
        {isError ? 'Try again' : 'Analyse'}
      </button>
    </div>
  )
}

function Hint({ text }: { text: string }) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <p
        className="text-xs font-black uppercase opacity-30 text-center"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {text}
      </p>
    </div>
  )
}

function AnalysisCards({ data }: { data: { vibe: string; impact: string; status_quo: string } }) {
  const cards = [
    { label: 'Vibe', value: data.vibe },
    { label: 'Impact', value: data.impact },
    { label: 'Status Quo', value: data.status_quo },
  ]

  return (
    <div className="flex flex-col divide-y divide-black/10">
      {cards.map(({ label, value }) => (
        <div key={label} className="px-5 py-3">
          <p
            className="text-[9px] font-black uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}
          >
            {label}
          </p>
          <p className="text-xs leading-relaxed font-medium">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ShimmerCards() {
  return (
    <div className="flex flex-col divide-y divide-black/10">
      {[56, 72, 48].map((w) => (
        <div key={w} className="px-5 py-3 flex flex-col gap-2">
          <div className="shimmer h-2 w-16 rounded-none" />
          <div className="shimmer h-3 rounded-none" style={{ width: `${w}%` }} />
          <div className="shimmer h-3 rounded-none" style={{ width: `${w - 12}%` }} />
        </div>
      ))}
    </div>
  )
}
