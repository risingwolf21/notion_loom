import { useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { GripVertical, Trash2, MapPin, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format, isPast, isToday, parseISO } from 'date-fns'
import type { Task } from '@/types/notion'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from './ui/item'

interface Props {
  task: Task
  hasCheckbox: boolean
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
  /** When set, show the database name as a sub-label (for smart list view) */
  databaseName?: string
}

export function TaskItem({ task, hasCheckbox, onToggle, onDelete, databaseName }: Props) {
  const { attributes, listeners, setNodeRef } = useSortable({ id: task.id })

  const handleToggle = useCallback((_: boolean) => {
    onToggle(task.id, task.done)
  }, [task.id, task.done, onToggle])

  const dueDateLabel = () => {
    if (!task.dueDate) return null
    const date = parseISO(task.dueDate)
    const dateStr = isToday(date) ? 'Today' : format(date, 'MMM d')
    const timeStr = task.dueTime ? ` · ${task.dueTime}` : ''
    const isOverdue = !task.done && isPast(date) && !isToday(date)
    return (
      <Badge
        variant={isOverdue ? 'destructive' : 'secondary'}
        className="text-[11px] px-1.5 py-0 gap-0.5"
      >
        <Clock size={9} />
        {dateStr}{timeStr}
      </Badge>
    )
  }

  return (
    <Item
      variant="outline"
      ref={setNodeRef}
      className="hover:bg-accent/50 transition-colors"
    >
      <ItemMedia>
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none shrink-0 transition-colors"
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          <GripVertical size={14} />
        </button>

        {hasCheckbox && (
          <Checkbox
            checked={task.done}
            onCheckedChange={handleToggle}
            aria-label={`Mark "${task.title}" as ${task.done ? 'incomplete' : 'complete'}`}
            className="shrink-0"
          />
        )}
      </ItemMedia>

      <ItemContent>
        <ItemTitle className={cn(
          'leading-snug break-words',
          task.done ? 'line-through text-muted-foreground' : 'text-foreground',
        )}>
          {task.title || <span className="text-muted-foreground italic">Untitled</span>}
        </ItemTitle>

        {/* Description */}
        {task.description && !task.done && (
          <ItemDescription className="text-xs line-clamp-2">{task.description}</ItemDescription>
        )}

        {/* Date, location, tags row */}
        {!task.done && (task.dueDate || task.location || task.tags.length > 0) && (
          <ItemDescription>
            <div className="flex flex-wrap items-center gap-1 mt-0.5">
              {task.dueDate && dueDateLabel()}
              {task.location && (
                <Badge variant="outline" className="text-[11px] px-1.5 py-0 gap-0.5 text-muted-foreground">
                  <MapPin size={9} />
                  {task.location}
                </Badge>
              )}
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[11px] px-1.5 py-0">{tag}</Badge>
              ))}
              {databaseName && (
                <span className="text-[11px] text-muted-foreground">{databaseName}</span>
              )}
            </div>
          </ItemDescription>
        )}

        {/* Database name for smart list (done tasks) */}
        {task.done && databaseName && (
          <ItemDescription className="text-[11px]">{databaseName}</ItemDescription>
        )}
      </ItemContent>

      <ItemActions>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-transparent group-hover:text-muted-foreground hover:!text-destructive hover:bg-destructive/10 transition-all"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete "${task.title}"`}
          tabIndex={-1}
        >
          <Trash2 size={13} />
        </Button>
      </ItemActions>
    </Item>
  )
}
