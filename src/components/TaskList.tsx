import { useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { ArrowLeft, RefreshCw, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert } from '@/components/ui/alert'
import { Tooltip } from '@/components/ui/tooltip'
import { TabsRoot, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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

  const doneCount   = tasks.filter((t) => t.done).length
  const activeCount = tasks.length - doneCount
  const totalCount  = tasks.length

  const emptyMessage =
    filter === 'active' && doneCount > 0 ? 'All tasks completed!' :
    filter === 'done'   && doneCount === 0 ? 'No completed tasks yet' :
    'No tasks yet — add one below'

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="flex items-center gap-1 px-2 py-2">
          <Tooltip content="Back" side="bottom">
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
              <ArrowLeft size={18} />
            </Button>
          </Tooltip>
          <div className="flex items-center gap-2 flex-1 min-w-0 px-1">
            {database.icon && <span className="text-lg shrink-0 leading-none">{database.icon}</span>}
            <h1 className="text-sm font-semibold text-foreground truncate">{database.title}</h1>
          </div>
          <div className="flex items-center shrink-0">
            <Tooltip content={loading ? 'Loading…' : 'Refresh'} side="bottom">
              <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh" disabled={loading}>
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </Button>
            </Tooltip>
            <Tooltip content="Settings" side="bottom">
              <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Settings">
                <Settings size={16} />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Progress */}
        {!loading && totalCount > 0 && (
          <div className="px-4 pb-2.5 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{doneCount} of {totalCount} completed</span>
              <span className="text-xs font-medium text-foreground">
                {Math.round((doneCount / totalCount) * 100)}%
              </span>
            </div>
            <Progress value={doneCount} max={totalCount} />
          </div>
        )}

        {/* Filter tabs */}
        <div className="px-3 pb-2">
          <TabsRoot value={filter} onValueChange={(v) => v && onFilterChange(v as TaskFilter)}>
            <TabsList className="w-full">
              <TabsTrigger value="active" className="flex-1 gap-1.5 text-xs">
                Active
                {!loading && activeCount > 0 && (
                  <Badge variant="default" className="rounded-full px-1.5 py-0 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center">
                    {activeCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="flex-1 text-xs">All</TabsTrigger>
              <TabsTrigger value="done" className="flex-1 gap-1.5 text-xs">
                Done
                {!loading && doneCount > 0 && (
                  <Badge variant="success" className="rounded-full px-1.5 py-0 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center">
                    {doneCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </TabsRoot>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-3">
          {error && (
            <Alert variant="destructive" title="Connection error">{error}</Alert>
          )}
          {!meta?.checkboxProp && !loading && (
            <Alert variant="warning">
              This database has no Checkbox property — tasks can't be checked off.
            </Alert>
          )}

          <Card className="overflow-hidden p-0">
            {loading ? (
              <div className="divide-y divide-border">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <Skeleton className="size-4 rounded-sm shrink-0" />
                    <Skeleton className={`h-3.5 ${i % 3 === 0 ? 'w-3/5' : 'flex-1'}`} />
                  </div>
                ))}
              </div>
            ) : visibleTasks.length === 0 ? (
              <div className="py-12 text-center px-6">
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
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
                  <div className={`divide-y divide-border ${isDragging ? 'cursor-grabbing' : ''}`}>
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
    </div>
  )
}
