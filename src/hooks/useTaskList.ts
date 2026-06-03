import { useState, useEffect, useCallback, useRef } from 'react'
import {
  queryDatabase, createPage, updatePage, archivePage, NotionAPIError,
} from '@/lib/notion'
import { detectDatabaseMeta, pageToTask } from '@/lib/notionProps'
import type { NotionDatabase, Task, DatabaseMeta } from '@/types/notion'
import type { Settings } from './useSettings'

export type TaskFilter = 'active' | 'all' | 'done'

const orderKey  = (id: string) => `notion_loom_order_${id}`
const filterKey = (id: string) => `notion_loom_filter_${id}`

function loadOrder(id: string): string[] {
  try { return JSON.parse(localStorage.getItem(orderKey(id)) ?? '[]') as string[] }
  catch { return [] }
}
function saveOrder(id: string, ids: string[]) {
  localStorage.setItem(orderKey(id), JSON.stringify(ids))
}

function applyOrder(tasks: Task[], order: string[]): Task[] {
  if (!order.length) return tasks
  const map = new Map(tasks.map((t) => [t.id, t]))
  const result: Task[] = []
  for (const id of order) {
    const t = map.get(id)
    if (t) { result.push(t); map.delete(id) }
  }
  for (const t of map.values()) result.unshift(t)
  return result
}

export function useTaskList(database: NotionDatabase, settings: Settings) {
  const [tasks, setTasks]     = useState<Task[]>([])
  const [meta, setMeta]       = useState<DatabaseMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [filter, setFilterState] = useState<TaskFilter>(
    () => (localStorage.getItem(filterKey(database.id)) as TaskFilter | null) ?? 'active',
  )
  const metaRef = useRef<DatabaseMeta | null>(null)

  const setFilter = useCallback((f: TaskFilter) => {
    localStorage.setItem(filterKey(database.id), f)
    setFilterState(f)
  }, [database.id])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const m = detectDatabaseMeta(database)
      setMeta(m)
      metaRef.current = m
      const pages = await queryDatabase(settings.workerUrl, settings.token, database.id)
      const raw   = pages.filter((p) => !p.archived).map((p) => pageToTask(p, m))
      setTasks(applyOrder(raw, loadOrder(database.id)))
    } catch (err) {
      setError(
        err instanceof NotionAPIError
          ? `Notion error ${err.status}: ${err.message}`
          : 'Failed to load tasks.',
      )
    } finally {
      setLoading(false)
    }
  }, [database, settings.workerUrl, settings.token])

  useEffect(() => { void reload() }, [reload])

  const toggleTask = useCallback(async (taskId: string, currentDone: boolean) => {
    const m = metaRef.current
    if (!m?.checkboxProp) return
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, done: !currentDone } : t))
    try {
      await updatePage(settings.workerUrl, settings.token, taskId, {
        checkboxPropName: m.checkboxProp!,
        checked: !currentDone,
      })
    } catch {
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, done: currentDone } : t))
    }
  }, [settings.workerUrl, settings.token])

  const addTask = useCallback(async (fields: import('@/lib/notion').TaskFields) => {
    const m = metaRef.current
    if (!m || !fields.title.trim()) return
    const tempId = `temp_${Date.now()}`
    const temp: Task = {
      id: tempId, title: fields.title.trim(), done: false,
      dueDate: fields.dueDate ?? null, dueTime: fields.dueTime ?? null,
      description: fields.description ?? null, location: fields.location ?? null,
      tags: fields.tags ?? [], createdTime: new Date().toISOString(),
    }
    setTasks((prev) => {
      const next = [temp, ...prev]
      saveOrder(database.id, next.map((t) => t.id))
      return next
    })
    try {
      const page = await createPage(settings.workerUrl, settings.token, database.id, m, fields)
      const real = pageToTask(page, m)
      setTasks((prev) => {
        const next = prev.map((t) => t.id === tempId ? real : t)
        saveOrder(database.id, next.map((t) => t.id))
        return next
      })
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== tempId))
    }
  }, [database.id, settings.workerUrl, settings.token])

  const deleteTask = useCallback(async (taskId: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== taskId)
      saveOrder(database.id, next.map((t) => t.id))
      return next
    })
    try {
      await archivePage(settings.workerUrl, settings.token, taskId)
    } catch {
      void reload()
    }
  }, [database.id, settings.workerUrl, settings.token, reload])

  const reorderTasks = useCallback((next: Task[]) => {
    setTasks(next)
    saveOrder(database.id, next.map((t) => t.id))
  }, [database.id])

  const visibleTasks =
    filter === 'active' ? tasks.filter((t) => !t.done) :
    filter === 'done'   ? tasks.filter((t) => t.done) :
    tasks

  return {
    tasks, visibleTasks, meta,
    loading, error,
    filter, setFilter,
    toggleTask, addTask, deleteTask, reorderTasks,
    refresh: reload,
  }
}
