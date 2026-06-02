import { RefreshCw, Settings, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip } from '@/components/ui/tooltip'
import { Alert } from '@/components/ui/alert'
import type { NotionDatabase } from '@/types/notion'

interface Props {
  databases: NotionDatabase[]
  loading: boolean
  error: string | null
  onSelect: (db: NotionDatabase) => void
  onRefresh: () => void
  onSettings: () => void
}

export function DatabasePicker({ databases, loading, error, onSelect, onRefresh, onSettings }: Props) {
  return (
    <div className="flex-1 flex flex-col bg-[var(--bg)] overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 bg-[var(--card)] border-b border-[var(--border)]"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 14px)', paddingBottom: '14px' }}
      >
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-[var(--fg)]">My Lists</h1>
          {!loading && databases.length > 0 && (
            <Badge variant="muted">{databases.length}</Badge>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip content="Refresh" side="bottom">
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              aria-label="Refresh"
              disabled={loading}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </Button>
          </Tooltip>
          <Tooltip content="Settings" side="bottom">
            <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Settings">
              <Settings size={18} />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {error && (
          <Alert variant="error" title="Connection error" className="mb-4">{error}</Alert>
        )}

        {loading ? (
          <Card className="overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}
              >
                <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
              </div>
            ))}
          </Card>
        ) : databases.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface2)] flex items-center justify-center">
              <Database size={26} className="text-[var(--fg3)]" />
            </div>
            <div className="space-y-1">
              <p className="text-[var(--fg)] font-semibold text-sm">No databases found</p>
              <p className="text-xs text-[var(--fg3)] leading-relaxed max-w-xs mx-auto">
                Make sure your Notion integration has access to at least one database.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Try again
            </Button>
          </div>
        ) : (
          <Card className="overflow-hidden">
            {databases.map((db, i) => (
              <button
                key={db.id}
                onClick={() => onSelect(db)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-[var(--surface2)] active:bg-[var(--surface2)] transition-colors text-left ${
                  i < databases.length - 1 ? 'border-b border-[var(--border)]' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] flex items-center justify-center text-xl shrink-0">
                  {db.icon ?? '📋'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--fg)] truncate">{db.title}</p>
                </div>
                <svg
                  width="6"
                  height="11"
                  viewBox="0 0 6 11"
                  fill="none"
                  className="text-[var(--fg3)] shrink-0"
                >
                  <path
                    d="M1 1l4 4.5-4 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
