import { useState } from 'react'
import { Eye, EyeOff, X, Trash2, Shield, Link2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
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
  const [token,        setToken]        = useState(settings.token)
  const [workerUrl,    setWorkerUrl]    = useState(settings.workerUrl)
  const [showToken,    setShowToken]    = useState(false)
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
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <SheetHeader className="px-5 py-3 flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <SheetClose className="size-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors">
            <X size={18} className="text-muted-foreground" />
          </SheetClose>
        </SheetHeader>

        <Separator />

        <div className="px-4 py-4 space-y-3 bg-background">
          {/* Connection */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              {!FIXED_WORKER_URL && (
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Link2 size={13} className="text-muted-foreground" />
                    Worker URL
                  </Label>
                  <Input
                    value={workerUrl}
                    onChange={(e) => setWorkerUrl(e.target.value)}
                    placeholder="https://your-worker.workers.dev"
                    type="url"
                    autoComplete="off"
                    autoCapitalize="none"
                  />
                  <p className="text-xs text-muted-foreground">URL of your Notion CORS proxy.</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Shield size={13} className="text-muted-foreground" />
                  Integration Token
                </Label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowToken((v) => !v)}
                    aria-label={showToken ? 'Hide token' : 'Show token'}
                  >
                    {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Stored locally on this device only.</p>
              </div>

              <Button className="w-full" onClick={save} disabled={!token.trim()}>
                Save changes
              </Button>
            </CardContent>
          </Card>

          {FIXED_WORKER_URL && (
            <Alert variant="info">
              Proxy is pre-configured — no Worker URL needed.
            </Alert>
          )}

          {/* Danger zone */}
          <Card>
            <CardContent className="pt-5 pb-4">
              <Button
                variant={clearConfirm ? 'destructive' : 'ghost'}
                className="w-full"
                onClick={handleClear}
                onBlur={() => setClearConfirm(false)}
              >
                <Trash2 size={15} />
                {clearConfirm ? 'Tap again to confirm' : 'Clear all data'}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2 leading-relaxed">
                Removes your token and all local data. Cannot be undone.
              </p>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
