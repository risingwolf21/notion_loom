import { useState, useCallback } from 'react'

export interface Settings {
  token: string
  workerUrl: string
}

const STORAGE_KEY = 'notion_loom_settings'

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Settings
  } catch { /* ignore */ }
  return { token: '', workerUrl: '' }
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(load)

  const saveSettings = useCallback((next: Settings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSettingsState(next)
  }, [])

  const clearAll = useCallback(() => {
    localStorage.clear()
    window.location.reload()
  }, [])

  return {
    settings,
    saveSettings,
    clearAll,
    isConfigured: Boolean(settings.token && settings.workerUrl),
  }
}
