import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { Tooltip } from '@/components/ui/tooltip'
import { AppBar } from '@/components/ui/appbar'
import { Spinner } from '@/components/ui/spinner'
import { Empty, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { ItemGroup } from '@/components/ui/item'
import { TaskItem } from './TaskItem'
import type { SmartFilter, TaskWithDatabase } from '@/hooks/useAllTasks'

const LABELS: Record<SmartFilter, string> = {
  today:   'Due Today',
  planned: 'Planned',
  all:     'All',
  done:    'Done',
}

interface Props {
  filter: SmartFilter
  tasks: TaskWithDatabase[]
  loading: boolean
  error: string | null
  onToggle: (taskId: string, dbId: string, done: boolean) => void
  onDelete: (taskId: string, dbId: string) => void
  onBack: () => void
  onRefresh: () => void
}

export function SmartListView({
  filter, tasks, loading, error,
  onToggle, onDelete, onBack, onRefresh,
}: Props) {
  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <AppBar
        title={LABELS[filter]}
        onBack={onBack}
        withScrollEffect={false}
        actions={
          <>
            <Tooltip content={loading ? 'Loading…' : 'Refresh'} side="bottom">
              <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh" disabled={loading}>
                {loading ? <Spinner /> : <RefreshCw size={16} />}
              </Button>
            </Tooltip>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {error && <Alert variant="destructive" title="Error" className="mb-4">{error}</Alert>}

        {loading ? (
          <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden bg-card">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                <Skeleton className="size-4 rounded-sm shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyTitle className="text-muted-foreground font-normal">No tasks here</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <ItemGroup>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                hasCheckbox={Boolean(task.meta.checkboxProp)}
                onToggle={(id, done) => onToggle(id, task.database.id, done)}
                onDelete={(id) => onDelete(id, task.database.id)}
                databaseName={task.database.title}
              />
            ))}
          </ItemGroup>
        )}
      </div>
    </div>
  )
}
