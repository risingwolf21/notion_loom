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
import { ArrowLeft, RefreshCw, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tooltip } from '@/components/ui/tooltip'
import { Alert } from '@/components/ui/alert'
import { TabsRoot, TabsList, TabsTab } from '@/components/ui/tabs'
import { TaskItem } from './TaskItem'
import { AddTaskRow } from './AddTaskRow'
import type { NotionDatabase, Task, DatabaseMeta } from '@/types/notion'
import type { TaskFilter } from '@/hooks/useTaskList'

interface Props {
  database: NotionDatabase
  tasks: Task[]
  visibleTasks: Task[]
  meta: DatabaseMeta | null
  loading: boolean
  error: string | null
  filter: TaskFilter
  onBack: () => void
  onSettings: () => void
  onToggleTask: (id: string, done: boolean) => void
  onDeleteTask: (id: string) => void
  onAddTask: (title: string, dueDate?: string) => void
  onReorder: (tasks: Task[]) => void
  onFilterChange: (f: TaskFilter) => void
  onRefresh: () => void
}

export function TaskList({
  database, tasks, visibleTasks, meta,
  loading, error, filter,
  onBack, onSettings, onToggleTask, onDeleteTask, onAddTask,
  onReorder, onFilterChange, onRefresh,
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

  const doneCount  = tasks.filter((t) => t.done).length
  const totalCount = tasks.length

  const emptyMessage =
    filter === 'active' && doneCount > 0 ? 'All tasks completed 🎉' :
    filter === 'done'   && doneCount === 0 ? 'No completed tasks yet' :
    'No tasks yet. Add one below!'

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg)] overflow-hidden">
      {/* Header */}
      <div
        className="bg-[var(--card)] border-b border-[var(--border)]"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Title row */}
        <div className="flex items-center gap-1 px-2 py-1.5">
          <Tooltip content="Back" side="bottom">
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
              <ArrowLeft size={20} />
            </Button>
          </Tooltip>
          <div className="flex items-center gap-2 flex-1 min-w-0 px-1">
            {database.icon && (
              <span className="text-xl shrink-0 leading-none">{database.icon}</span>
            )}
            <h1 className="text-base font-semibold text-[var(--fg)] truncate">
              {database.title}
            </h1>
          </div>
          <div className="flex items-center shrink-0">
            <Tooltip content={loading ? 'Loading…' : 'Refresh'} side="bottom">
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                aria-label="Refresh"
                disabled={loading}
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </Button>
            </Tooltip>
            <Tooltip content="Settings" side="bottom">
              <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Settings">
                <Settings size={18} />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Progress bar */}
        {!loading && totalCount > 0 && (
          <div className="px-4 pt-0.5 pb-2.5 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--fg3)]">
                {doneCount} of {totalCount} completed
              </span>
              <span className="text-xs font-semibold text-[var(--primary)]">
                {Math.round((doneCount / totalCount) * 100)}%
              </span>
            </div>
            <Progress value={doneCount} max={totalCount} />
          </div>
        )}

        {/* Filter tabs */}
        <div className="px-3 pb-2.5">
          <TabsRoot
            value={filter}
            onValueChange={(v) => v && onFilterChange(v as TaskFilter)}
          >
            <TabsList className="w-full">
              <TabsTab value="active" className="flex-1">
                Active
                {!loading && totalCount - doneCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold w-4 h-4 inline-flex items-center justify-center">
                    {totalCount - doneCount}
                  </span>
                )}
              </TabsTab>
              <TabsTab value="all" className="flex-1">All</TabsTab>
              <TabsTab value="done" className="flex-1">
                Done
                {!loading && doneCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-[var(--success)] text-white text-[10px] font-bold w-4 h-4 inline-flex items-center justify-center">
                    {doneCount}
                  </span>
                )}
              </TabsTab>
            </TabsList>
          </TabsRoot>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-3">
          {error && (
            <Alert variant="error" title="Connection error">{error}</Alert>
          )}

          {!meta?.checkboxProp && !loading && (
            <Alert variant="warning">
              This database has no Checkbox property — tasks can't be checked off.
            </Alert>
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
              <div className="py-14 text-center px-6">
                <p className="text-sm text-[var(--fg3)]">{emptyMessage}</p>
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
                  <div
                    className={`divide-y divide-[var(--border)] ${isDragging ? 'cursor-grabbing' : ''}`}
                  >
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
                <AddTaskRow onAdd={onAddTask} hasDateProp={Boolean(meta?.dateProp)} />
              </>
            )}
          </Card>
        </div>
      </div>

      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </div>
  )
}
