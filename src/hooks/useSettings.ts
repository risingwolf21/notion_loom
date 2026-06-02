import { useState, useCallback } from 'react'
import { FIXED_WORKER_URL } from '@/lib/config'

export interface Settings {
  token: string
  workerUrl: string
}

const STORAGE_KEY = 'notion_loom_settings'

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const stored = JSON.parse(raw) as Settings
      return { ...stored, workerUrl: FIXED_WORKER_URL ?? stored.workerUrl }
    }
  } catch { /* ignore */ }
  return { token: '', workerUrl: FIXED_WORKER_URL ?? '' }
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(load)

  const saveSettings = useCallback((next: Settings) => {
    const toStore: Settings = {
      ...next,
      workerUrl: FIXED_WORKER_URL ?? next.workerUrl,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
    setSettingsState(toStore)
  }, [])

  const clearAll = useCallback(() => {
    localStorage.clear()
    window.location.reload()
  }, [])

  return {
    settings,
    saveSettings,
    clearAll,
    workerUrlFixed: Boolean(FIXED_WORKER_URL),
    isConfigured: Boolean(settings.token && settings.workerUrl),
  }
}
