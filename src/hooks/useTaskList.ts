import { useState, useEffect, useCallback, useRef } from 'react'
import {
  queryDatabase, createPage, updatePage, archivePage, NotionAPIError,
} from '@/lib/notion'
import { detectDatabaseMeta, pageToTask } from '@/lib/notionProps'
import type { NotionDatabase, Task, DatabaseMeta } from '@/types/notion'
import type { Settings } from './useSettings'

const orderKey   = (id: string) => `notion_loom_order_${id}`
const showDoneKey = (id: string) => `notion_loom_done_${id}`

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
  const [tasks, setTasks]         = useState<Task[]>([])
  const [meta, setMeta]           = useState<DatabaseMeta | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [showDone, setShowDone]   = useState(
    () => localStorage.getItem(showDoneKey(database.id)) !== 'false',
  )
  const metaRef = useRef<DatabaseMeta | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const m = detectDatabaseMeta(database)
      setMeta(m)
      metaRef.current = m
      const pages    = await queryDatabase(settings.workerUrl, settings.token, database.id)
      const raw      = pages.filter((p) => !p.archived).map((p) => pageToTask(p, m))
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

  const addTask = useCallback(async (title: string, dueDate?: string) => {
    const m = metaRef.current
    if (!m || !title.trim()) return
    const tempId = `temp_${Date.now()}`
    const temp: Task = { id: tempId, title: title.trim(), done: false, dueDate: dueDate ?? null, createdTime: new Date().toISOString() }
    setTasks((prev) => {
      const next = [temp, ...prev]
      saveOrder(database.id, next.map((t) => t.id))
      return next
    })
    try {
      const page = await createPage(
        settings.workerUrl, settings.token, database.id,
        m.titleProp, title.trim(),
        m.checkboxProp ?? undefined,
        m.dateProp ?? undefined, dueDate,
      )
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

  const toggleShowDone = useCallback(() => {
    setShowDone((prev) => {
      localStorage.setItem(showDoneKey(database.id), String(!prev))
      return !prev
    })
  }, [database.id])

  const visibleTasks = showDone ? tasks : tasks.filter((t) => !t.done)

  return {
    tasks, visibleTasks, meta,
    loading, error,
    showDone, toggleShowDone,
    toggleTask, addTask, deleteTask, reorderTasks,
    refresh: reload,
  }
}
