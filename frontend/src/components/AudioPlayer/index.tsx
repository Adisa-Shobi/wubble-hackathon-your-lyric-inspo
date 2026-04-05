import { useRef, useState, useEffect } from 'react'
import { formatTime } from '../../lib/utils'

interface AudioPlayerProps {
  url: string
}

export default function AudioPlayer({ url }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const isInitialMount = useRef(true)

  // Reset and auto-play when a new URL arrives (skip initial mount to avoid
  // auto-playing a track that was saved from a previous session)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    audioRef.current?.play().catch(() => {})
  }, [url])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    playing ? audio.pause() : audio.play()
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current
    if (!audio) return
    const t = Number(e.target.value)
    audio.currentTime = t
    setCurrentTime(t)
  }

  return (
    <div
      className="flex-shrink-0 h-16 flex items-center gap-4 px-6"
      style={{ backgroundColor: 'var(--accent)', borderTop: 'var(--border)' }}
    >
      <audio
        ref={audioRef}
        src={url}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
      />

      <button
        className="btn-brutal bg-white p-0 flex-shrink-0"
        style={{ width: '2.25rem', height: '2.25rem' }}
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18, pointerEvents: 'none' }}>
          {playing ? 'pause' : 'play_arrow'}
        </span>
      </button>

      <span
        className="flex-shrink-0 text-[10px] font-black tabular-nums"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {formatTime(currentTime)}
      </span>

      <input
        type="range"
        className="audio-scrubber flex-1 min-w-0"
        min={0}
        max={duration || 1}
        step={0.1}
        value={currentTime}
        onChange={handleSeek}
        aria-label="Seek"
      />

      <span
        className="flex-shrink-0 text-[10px] font-black tabular-nums"
        style={{ fontFamily: 'var(--font-mono)', color: 'rgba(0,0,0,0.5)' }}
      >
        {formatTime(duration)}
      </span>

      <span
        className="text-[10px] font-black uppercase tracking-widest ml-auto"
        style={{ fontFamily: 'var(--font-mono)', color: 'rgba(0,0,0,0.5)' }}
      >
        WUBBLE TRACK
      </span>
    </div>
  )
}
