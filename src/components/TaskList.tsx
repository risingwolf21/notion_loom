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
import { ArrowLeft, RefreshCw, Settings, Eye, EyeOff, AlertCircle, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
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
    const visibleIds = new Set(visibleTasks.map((t) => t.id))
    const hidden = tasks.filter((t) => !visibleIds.has(t.id))
    onReorder([...reorderedVisible, ...hidden])
  }

  const doneCount = tasks.filter((t) => t.done).length

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg)] overflow-hidden">
      <div
        className="bg-[var(--card)] border-b border-[var(--border)]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-1 px-2 py-1.5">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2 flex-1 min-w-0 px-1">
            {database.icon && <span className="text-xl shrink-0 leading-none">{database.icon}</span>}
            <h1 className="text-base font-semibold text-[var(--fg)] truncate">{database.title}</h1>
          </div>
          <div className="flex items-center shrink-0">
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

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-3">
          {error && (
            <div className="flex items-start gap-2.5 text-sm text-[var(--destructive)] bg-[rgba(255,59,48,0.08)] rounded-xl px-4 py-3 border border-[rgba(255,59,48,0.15)]">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {!meta?.checkboxProp && !loading && (
            <div className="flex items-center gap-2 text-xs text-[var(--fg3)] bg-[var(--surface2)] rounded-xl px-3.5 py-2.5">
              <CheckSquare size={13} className="shrink-0" />
              This database has no Checkbox property — tasks can't be checked off.
            </div>
          )}

          <Card className="overflow-hidden">
            {loading ? (
              <div className="divide-y divide-[var(--border)]">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                    <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                    <Skeleton className={`h-3.5 ${i % 3 === 0 ? 'w-3/5' : 'flex-1'}`} />
                  </div>
                ))}
              </div>
            ) : visibleTasks.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-sm text-[var(--fg3)]">
                  {tasks.length > 0 ? 'All tasks completed 🎉' : 'No tasks yet'}
                </p>
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
          </Card>
        </div>
      </div>

      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </div>
  )
}
