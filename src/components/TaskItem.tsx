import { useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format, isPast, isToday, parseISO } from 'date-fns'
import type { Task } from '@/types/notion'

interface Props {
  task: Task
  hasCheckbox: boolean
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, hasCheckbox, onToggle, onDelete }: Props) {
  const {
    attributes, listeners,
    setNodeRef, transform, transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleToggle = useCallback((_checked: boolean) => {
    onToggle(task.id, task.done)
  }, [task.id, task.done, onToggle])

  const dueDateBadge = () => {
    if (!task.dueDate) return null
    const date = parseISO(task.dueDate)
    const label = isToday(date) ? 'Today' : format(date, 'MMM d')
    const variant = !task.done && isPast(date) && !isToday(date) ? 'destructive' : 'secondary'
    return <Badge variant={variant} className="text-[11px] px-1.5 py-0">{label}</Badge>
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-3 py-2.5 group hover:bg-accent/50 transition-colors"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none shrink-0 transition-colors"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <GripVertical size={14} />
      </button>

      {/* Checkbox */}
      {hasCheckbox && (
        <Checkbox
          checked={task.done}
          onCheckedChange={handleToggle}
          aria-label={`Mark "${task.title}" as ${task.done ? 'incomplete' : 'complete'}`}
          className="shrink-0"
        />
      )}

      {/* Title + date */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm leading-snug break-words',
          task.done ? 'line-through text-muted-foreground' : 'text-foreground',
        )}>
          {task.title || <span className="text-muted-foreground italic">Untitled</span>}
        </p>
        {task.dueDate && !task.done && (
          <div className="mt-0.5">{dueDateBadge()}</div>
        )}
      </div>

      {/* Delete button — appears on row hover */}
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
    </div>
  )
}
