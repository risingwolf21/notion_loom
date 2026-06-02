import { useState, useEffect, useCallback } from 'react'
import { listDatabases, NotionAPIError } from '@/lib/notion'
import type { NotionDatabase } from '@/types/notion'
import type { Settings } from './useSettings'

export function useNotionDatabases(settings: Settings) {
  const [databases, setDatabases] = useState<NotionDatabase[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!settings.token || !settings.workerUrl) return
    setLoading(true)
    setError(null)
    try {
      setDatabases(await listDatabases(settings.workerUrl, settings.token))
    } catch (err) {
      setError(
        err instanceof NotionAPIError
          ? `Notion error ${err.status}: ${err.message}`
          : 'Could not reach Worker. Check the URL and try again.',
      )
    } finally {
      setLoading(false)
    }
  }, [settings.token, settings.workerUrl])

  useEffect(() => { void fetch() }, [fetch])

  return { databases, loading, error, refresh: fetch }
}
