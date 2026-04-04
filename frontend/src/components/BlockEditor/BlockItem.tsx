import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useRef, useEffect } from 'react'
import type { Block, BlockType } from '../../types'
import { UI_BLOCK_TYPES } from '../../types'

interface BlockItemProps {
  block: Block
  onUpdate: (patch: Partial<Block>) => void
  onDelete: () => void
  isDragging: boolean
  isOverlay?: boolean
}

export default function BlockItem({ block, onUpdate, onDelete, isDragging, isOverlay = false }: BlockItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [block.content])

  return (
    <div
      ref={setNodeRef}
      className="bg-[var(--surface-card)] group"
      style={{
        border: 'var(--border)',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        boxShadow: isOverlay ? 'var(--shadow-md)' : undefined,
      }}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '2px solid rgba(0,0,0,0.12)' }}
      >
        {/* Drag handle — listeners here so textarea clicks aren't intercepted */}
        <button
          className="flex-shrink-0 cursor-grab opacity-0 group-hover:opacity-40 transition-opacity p-0.5"
          aria-label="Drag to reorder"
          style={{ userSelect: 'none' }}
          {...attributes}
          {...listeners}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, pointerEvents: 'none' }}>
            drag_indicator
          </span>
        </button>

        {/* Block type chips */}
        <div className="flex gap-1 flex-wrap flex-1 min-w-0">
          {UI_BLOCK_TYPES.map((type) => (
            <button
              key={type}
              className={`chip chip-${type} transition-opacity`}
              style={{ opacity: block.type === type ? 1 : 0.35, cursor: 'pointer' }}
              onClick={() => onUpdate({ type: type as BlockType })}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Delete */}
        <button
          className="btn-destructive flex-shrink-0 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ width: '1.75rem', height: '1.75rem' }}
          onClick={onDelete}
          aria-label="Delete block"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14, pointerEvents: 'none' }}>close</span>
        </button>
      </div>

      {/* ── Textarea ───────────────────────────────────────────── */}
      <textarea
        ref={textareaRef}
        className="w-full bg-transparent outline-none font-bold leading-relaxed px-4 py-3 block"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.875rem',
          minHeight: '5rem',
          resize: 'none',
          overflow: 'hidden',
        }}
        value={block.content}
        placeholder="Start writing..."
        rows={1}
        spellCheck={false}
        onChange={(e) => onUpdate({ content: e.target.value })}
      />
    </div>
  )
}
