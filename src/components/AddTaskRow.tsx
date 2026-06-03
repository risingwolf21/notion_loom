import { useState, useRef, type KeyboardEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  onAdd: (title: string, dueDate?: string) => void
  hasDateProp: boolean
}

export function AddTaskRow({ onAdd, hasDateProp }: Props) {
  const [open, setOpen]       = useState(false)
  const [title, setTitle]     = useState('')
  const [dueDate, setDueDate] = useState('')
  const inputRef              = useRef<HTMLInputElement>(null)

  function submit() {
    if (!title.trim()) return
    onAdd(title.trim(), dueDate || undefined)
    setTitle('')
    setDueDate('')
    inputRef.current?.focus()
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter')  submit()
    if (e.key === 'Escape') { setOpen(false); setTitle(''); setDueDate('') }
  }

  function dismiss() {
    setOpen(false)
    setTitle('')
    setDueDate('')
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Plus size={14} className="shrink-0" />
        New task
      </button>
    )
  }

  return (
    <div className="px-4 py-3 space-y-2 bg-background border-t border-border">
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Task title"
        autoFocus
      />
      {hasDateProp && (
        <Input
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          type="date"
          placeholder="Due date (optional)"
        />
      )}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={dismiss} className="flex-none">
          <X size={14} />
          Cancel
        </Button>
        <Button size="sm" onClick={submit} disabled={!title.trim()} className="flex-1">
          Add task
        </Button>
      </div>
    </div>
  )
}
