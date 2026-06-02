import { useState, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDrag } from '@use-gesture/react'
import { GripVertical, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@base-ui/react/checkbox'
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
  const [swipeX, setSwipeX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const {
    attributes, listeners,
    setNodeRef, transform, transition,
    isDragging: isSortDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortDragging ? 0.5 : 1,
  }

  const bind = useDrag(
    ({ movement: [mx], down, first, last, cancel }) => {
      if (isSortDragging) { cancel(); return }
      if (first) setIsDragging(false)

      // Only allow left swipe
      if (mx > 8) { cancel(); return }

      const clamped = Math.min(0, mx)
      setSwipeX(down ? clamped : 0)

      if (last && clamped < -90) {
        onDelete(task.id)
      }
      if (!down) setSwipeX(0)
    },
    { filterTaps: true, axis: 'x' },
  )

  const handleToggle = useCallback(() => {
    if (!isDragging) onToggle(task.id, task.done)
  }, [isDragging, task.id, task.done, onToggle])

  const dueDateBadge = () => {
    if (!task.dueDate) return null
    const date = parseISO(task.dueDate)
    const label = isToday(date) ? 'Today' : format(date, 'MMM d')
    const variant = !task.done && isPast(date) && !isToday(date) ? 'danger' : 'muted'
    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <div ref={setNodeRef} style={style} className="relative overflow-hidden">
      {/* Delete background */}
      <div
        className="absolute inset-0 bg-[var(--destructive)] flex items-center justify-end pr-5"
        aria-hidden
      >
        <Trash2 size={20} className="text-white" />
      </div>

      {/* Swipeable content */}
      <div
        {...bind()}
        className="relative flex items-center gap-3 px-4 py-3 bg-[var(--card)] select-none"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: swipeX === 0 ? 'transform 0.3s cubic-bezier(0.32,0.72,0,1)' : 'none',
          touchAction: 'pan-y',
        }}
      >
        {/* Drag handle — DnD only activates here */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 text-[var(--fg3)] cursor-grab active:cursor-grabbing touch-none shrink-0"
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          <GripVertical size={16} />
        </button>

        {/* Checkbox */}
        {hasCheckbox && (
          <Checkbox.Root
            checked={task.done}
            onCheckedChange={handleToggle}
            className={cn(
              'w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200 cursor-pointer',
              task.done
                ? 'bg-[var(--success)] border-[var(--success)]'
                : 'border-[var(--separator)]',
            )}
            aria-label={`Mark "${task.title}" as ${task.done ? 'incomplete' : 'complete'}`}
          >
            <Checkbox.Indicator
              className={cn(
                'transition-all duration-150',
                task.done ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
              )}
            >
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M1 4l3.5 4L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Checkbox.Indicator>
          </Checkbox.Root>
        )}

        {/* Title + date */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm leading-snug break-words',
              task.done ? 'line-through text-[var(--fg3)]' : 'text-[var(--fg)]',
            )}
          >
            {task.title || <span className="text-[var(--fg3)]">Untitled</span>}
          </p>
          {task.dueDate && !task.done && (
            <div className="mt-1">{dueDateBadge()}</div>
          )}
        </div>
      </div>
    </div>
  )
}
