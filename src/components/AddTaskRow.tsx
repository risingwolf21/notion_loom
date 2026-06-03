import { useState, useRef, type KeyboardEvent } from 'react'
import { Plus, X, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { TaskFields } from '@/lib/notion'
import type { DatabaseMeta } from '@/types/notion'

interface Props {
  onAdd: (fields: TaskFields) => void
  meta: DatabaseMeta | null
}

export function AddTaskRow({ onAdd, meta }: Props) {
  const [open, setOpen]             = useState(false)
  const [expanded, setExpanded]     = useState(false)
  const [title, setTitle]           = useState('')
  const [dueDate, setDueDate]       = useState('')
  const [dueTime, setDueTime]       = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation]     = useState('')
  const [tags, setTags]             = useState('')
  const inputRef                    = useRef<HTMLInputElement>(null)

  function submit() {
    if (!title.trim()) return
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)
    onAdd({
      title: title.trim(),
      dueDate:     dueDate     || undefined,
      dueTime:     dueTime     || undefined,
      description: description || undefined,
      location:    location    || undefined,
      tags:        tagList.length ? tagList : undefined,
    })
    setTitle(''); setDueDate(''); setDueTime('')
    setDescription(''); setLocation(''); setTags('')
    setExpanded(false)
    inputRef.current?.focus()
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter')  submit()
    if (e.key === 'Escape') dismiss()
  }

  function dismiss() {
    setOpen(false); setExpanded(false)
    setTitle(''); setDueDate(''); setDueTime('')
    setDescription(''); setLocation(''); setTags('')
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

  const hasExtras = !!(meta?.descriptionProp || meta?.locationProp || meta?.tagsProp)

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

      {meta?.dateProp && (
        <div className="flex gap-2">
          <Input
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            type="date"
            className="flex-1"
          />
          <Input
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            type="time"
            className="w-32"
            disabled={!dueDate}
          />
        </div>
      )}

      {hasExtras && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Fewer details' : 'Add details'}
        </button>
      )}

      {expanded && (
        <div className="space-y-2">
          {meta?.descriptionProp && (
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
          )}
          {meta?.locationProp && (
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
            />
          )}
          {meta?.tagsProp && (
            <div className="space-y-1">
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (comma separated)"
              />
              {tags && (
                <div className="flex flex-wrap gap-1 px-0.5">
                  {tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[11px] px-1.5 py-0">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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
