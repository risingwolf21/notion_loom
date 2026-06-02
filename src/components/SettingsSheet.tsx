import { useState } from 'react'
import { Eye, EyeOff, X, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { FIXED_WORKER_URL } from '@/lib/config'
import type { Settings } from '@/hooks/useSettings'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  settings: Settings
  onSave: (s: Settings) => void
  onClear: () => void
}

export function SettingsSheet({ open, onOpenChange, settings, onSave, onClear }: Props) {
  const [token,     setToken]     = useState(settings.token)
  const [workerUrl, setWorkerUrl] = useState(settings.workerUrl)
  const [showToken, setShowToken] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)

  function save() {
    onSave({ token: token.trim(), workerUrl: FIXED_WORKER_URL ?? workerUrl.trim() })
    onOpenChange(false)
  }

  function handleClear() {
    if (clearConfirm) { onClear() }
    else setClearConfirm(true)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Settings">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[var(--separator)]" />
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-lg font-semibold text-[var(--fg)]">Settings</h2>
          <SheetClose className="p-1.5 rounded-full hover:bg-[var(--surface2)] transition-colors">
            <X size={18} className="text-[var(--fg3)]" />
          </SheetClose>
        </div>

        <Separator />

        <div className="px-5 py-5 space-y-5">
          {!FIXED_WORKER_URL && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--fg)]">
                Cloudflare Worker URL
              </label>
              <Input
                value={workerUrl}
                onChange={(e) => setWorkerUrl(e.target.value)}
                placeholder="https://your-worker.workers.dev"
                type="url"
                autoComplete="off"
                autoCapitalize="none"
              />
              <p className="text-xs text-[var(--fg3)]">The URL of your Notion proxy Worker.</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--fg)]">
              Notion Integration Token
            </label>
            <div className="relative">
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                type={showToken ? 'text' : 'password'}
                placeholder="secret_…"
                autoComplete="off"
                autoCapitalize="none"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg3)] hover:text-[var(--fg)] transition-colors"
                onClick={() => setShowToken(v => !v)}
                aria-label={showToken ? 'Hide token' : 'Show token'}
              >
                {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-[var(--fg3)]">Stored locally on this device only.</p>
          </div>

          <Button className="w-full" onClick={save}>
            Save
          </Button>
        </div>

        <Separator />

        <div className="px-5 py-4">
          <Button
            variant={clearConfirm ? 'destructive' : 'ghost'}
            className="w-full"
            onClick={handleClear}
            onBlur={() => setClearConfirm(false)}
          >
            <Trash2 size={15} />
            {clearConfirm ? 'Confirm — erase everything?' : 'Clear all data'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
