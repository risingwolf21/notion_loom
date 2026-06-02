import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { ArrowLeft, RefreshCw, Settings, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskItem } from './TaskItem'
import { AddTaskRow } from './AddTaskRow'
import type { NotionDatabase, Task } from '@/types/notion'
import type { DatabaseMeta } from '@/types/notion'

interface Props {
  database: NotionDatabase
  tasks: Task[]
  visibleTasks: Task[]
  meta: DatabaseMeta | null
  loading: boolean
  error: string | null
  showDone: boolean
  onBack: () => void
  onSettings: () => void
  onToggleTask: (id: string, done: boolean) => void
  onDeleteTask: (id: string) => void
  onAddTask: (title: string, dueDate?: string) => void
  onReorder: (tasks: Task[]) => void
  onToggleShowDone: () => void
  onRefresh: () => void
}

export function TaskList({
  database, tasks, visibleTasks, meta,
  loading, error, showDone,
  onBack, onSettings, onToggleTask, onDeleteTask, onAddTask,
  onReorder, onToggleShowDone, onRefresh,
}: Props) {
  const [isDragging, setIsDragging] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    setIsDragging(false)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = visibleTasks.findIndex((t) => t.id === active.id)
    const newIdx = visibleTasks.findIndex((t) => t.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return

    const reorderedVisible = arrayMove(visibleTasks, oldIdx, newIdx)
    // Merge with hidden (done) tasks kept at end
    const visibleIds = new Set(visibleTasks.map((t) => t.id))
    const hidden = tasks.filter((t) => !visibleIds.has(t.id))
    onReorder([...reorderedVisible, ...hidden])
  }

  const doneCount = tasks.filter((t) => t.done).length

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg)] overflow-hidden">
      {/* Header */}
      <div
        className="bg-[var(--card)] border-b border-[var(--border)]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-2 px-2 py-2">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {database.icon && <span className="text-xl shrink-0">{database.icon}</span>}
            <h1 className="text-lg font-semibold text-[var(--fg)] truncate">{database.title}</h1>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {doneCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleShowDone}
                aria-label={showDone ? 'Hide completed' : 'Show completed'}
                title={showDone ? `Hide ${doneCount} completed` : `Show ${doneCount} completed`}
              >
                {showDone ? <Eye size={18} /> : <EyeOff size={18} />}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh" disabled={loading}>
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Settings">
              <Settings size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-3">
          {error && (
            <div className="flex items-start gap-2 text-sm text-[var(--destructive)] bg-[rgba(255,59,48,0.08)] rounded-xl px-3 py-2.5">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!meta?.checkboxProp && !loading && (
            <div className="text-xs text-[var(--fg3)] bg-[var(--surface2)] rounded-xl px-3 py-2">
              This database has no Checkbox property — tasks can't be checked off.
            </div>
          )}

          {/* Task list */}
          <div className="bg-[var(--card)] rounded-2xl overflow-hidden">
            {loading ? (
              <div className="divide-y divide-[var(--border)]">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                    <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                    <Skeleton className={`h-4 ${i % 3 === 0 ? 'w-3/5' : 'flex-1'}`} />
                  </div>
                ))}
              </div>
            ) : visibleTasks.length === 0 ? (
              <div className="py-12 text-center text-sm text-[var(--fg3)]">
                {tasks.length > 0 ? 'All tasks completed 🎉' : 'No tasks yet'}
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setIsDragging(false)}
              >
                <SortableContext
                  items={visibleTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={`divide-y divide-[var(--border)] ${isDragging ? 'cursor-grabbing' : ''}`}>
                    {visibleTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        hasCheckbox={Boolean(meta?.checkboxProp)}
                        onToggle={onToggleTask}
                        onDelete={onDeleteTask}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {!loading && (
              <>
                <Separator />
                <AddTaskRow
                  onAdd={onAddTask}
                  hasDateProp={Boolean(meta?.dateProp)}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Safe area padding */}
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </div>
  )
}
