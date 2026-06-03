import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { queryDatabase, updatePage, archivePage, NotionAPIError } from '@/lib/notion'
import { detectDatabaseMeta, pageToTask } from '@/lib/notionProps'
import type { NotionDatabase, Task, DatabaseMeta } from '@/types/notion'
import type { Settings } from './useSettings'

export type SmartFilter = 'today' | 'planned' | 'all' | 'done'

export interface TaskWithDatabase extends Task {
  database: NotionDatabase
  meta: DatabaseMeta
}

export interface SmartCounts {
  today: number
  planned: number
  all: number
  done: number
  reminders: number
}

function todayStr() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function useAllTasks(databases: NotionDatabase[], settings: Settings) {
  const [taskMap, setTaskMap] = useState<Map<string, TaskWithDatabase[]>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!databases.length || !settings.token || !settings.workerUrl) return
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.all(
        databases.map(async (db) => {
          const meta = detectDatabaseMeta(db)
          const pages = await queryDatabase(settings.workerUrl, settings.token, db.id)
          return [
            db.id,
            pages
              .filter((p) => !p.archived)
              .map((p) => ({ ...pageToTask(p, meta), database: db, meta })),
          ] as [string, TaskWithDatabase[]]
        }),
      )
      setTaskMap(new Map(results))
    } catch (err) {
      setError(
        err instanceof NotionAPIError
          ? `Notion error ${err.status}: ${err.message}`
          : 'Failed to load tasks.',
      )
    } finally {
      setLoading(false)
    }
  }, [databases, settings.token, settings.workerUrl])

  useEffect(() => { void reload() }, [reload])

  const allTasks = [...taskMap.values()].flat()
  const today = todayStr()

  const counts: SmartCounts = {
    today:     allTasks.filter((t) => !t.done && !!t.dueDate && t.dueDate <= today).length,
    planned:   allTasks.filter((t) => !t.done && !!t.dueDate && t.dueDate > today).length,
    all:       allTasks.filter((t) => !t.done).length,
    done:      allTasks.filter((t) => t.done).length,
    reminders: allTasks.filter((t) => !t.done && t.database.title.toLowerCase() === 'reminders').length,
  }

  function filterTasks(filter: SmartFilter): TaskWithDatabase[] {
    const t = today
    switch (filter) {
      case 'today':   return allTasks.filter((task) => !task.done && !!task.dueDate && task.dueDate <= t)
      case 'planned': return allTasks.filter((task) => !task.done && !!task.dueDate && task.dueDate > t)
      case 'all':     return allTasks.filter((task) => !task.done)
      case 'done':    return allTasks.filter((task) => task.done)
    }
  }

  const toggleTask = useCallback((taskId: string, dbId: string, currentDone: boolean) => {
    setTaskMap((prev) => {
      const next = new Map(prev)
      const tasks = next.get(dbId)
      if (!tasks) return prev
      const task = tasks.find((t) => t.id === taskId)
      if (!task?.meta.checkboxProp) return prev
      next.set(dbId, tasks.map((t) => t.id === taskId ? { ...t, done: !currentDone } : t))
      updatePage(settings.workerUrl, settings.token, taskId, {
        checkboxPropName: task.meta.checkboxProp!,
        checked: !currentDone,
      }).catch(() => {
        setTaskMap((rollback) => {
          const rb = new Map(rollback)
          const rbtasks = rb.get(dbId)
          if (rbtasks) rb.set(dbId, rbtasks.map((t) => t.id === taskId ? { ...t, done: currentDone } : t))
          return rb
        })
      })
      return next
    })
  }, [settings.workerUrl, settings.token])

  const deleteTask = useCallback((taskId: string, dbId: string) => {
    setTaskMap((prev) => {
      const next = new Map(prev)
      const tasks = next.get(dbId)
      if (tasks) next.set(dbId, tasks.filter((t) => t.id !== taskId))
      return next
    })
    archivePage(settings.workerUrl, settings.token, taskId).catch(() => void reload())
  }, [settings.workerUrl, settings.token, reload])

  return { loading, error, counts, filterTasks, toggleTask, deleteTask, refresh: reload }
}
