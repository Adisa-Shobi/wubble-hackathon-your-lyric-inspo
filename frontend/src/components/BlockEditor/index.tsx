import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useState, useCallback } from 'react'
import type { Block, BlockType } from '../../types'
import { uuid } from '../../lib/utils'
import BlockItem from './BlockItem'

interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIdx = blocks.findIndex((b) => b.id === active.id)
    const newIdx = blocks.findIndex((b) => b.id === over.id)
    onChange(arrayMove(blocks, oldIdx, newIdx).map((b, i) => ({ ...b, sequence: i })))
  }, [blocks, onChange])

  const updateBlock = useCallback((id: string, patch: Partial<Block>) => {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }, [blocks, onChange])

  const deleteBlock = useCallback((id: string) => {
    onChange(blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, sequence: i })))
  }, [blocks, onChange])

  function addBlock() {
    onChange([
      ...blocks,
      { id: uuid(), type: 'verse' as BlockType, content: '', sequence: blocks.length },
    ])
  }

  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) ?? null : null

  if (blocks.length === 0) {
    return (
      <div className="h-full overflow-y-auto px-6 pt-6 pb-24">
        <div
          className="w-full p-8 flex flex-col items-start gap-4"
          style={{ border: 'var(--border)', borderStyle: 'dashed' }}
        >
          <p
            className="text-2xl uppercase opacity-30"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            No blocks yet
          </p>
          <p className="text-xs font-bold uppercase opacity-30">
            Add your first block to start writing
          </p>
          <button className="btn-brutal bg-[var(--accent)] px-6 py-3" onClick={addBlock}>
            + Add block
          </button>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="h-full overflow-y-auto px-6 pt-6 pb-6 flex flex-col gap-4">
          {blocks.map((block) => (
            <BlockItem
              key={block.id}
              block={block}
              onUpdate={(patch) => updateBlock(block.id, patch)}
              onDelete={() => deleteBlock(block.id)}
              isDragging={activeId === block.id}
            />
          ))}

          <button className="btn-ghost w-full py-3" onClick={addBlock}>
            + Add block
          </button>
        </div>
      </SortableContext>

      <DragOverlay>
        {activeBlock && (
          <BlockItem
            block={activeBlock}
            onUpdate={() => {}}
            onDelete={() => {}}
            isDragging={false}
            isOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
