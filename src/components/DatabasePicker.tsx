import { RefreshCw, AlertCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
        className="flex items-center justify-between px-4 py-3 bg-[var(--card)] border-b border-[var(--border)]"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <h1 className="text-xl font-bold text-[var(--fg)]">My Lists</h1>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh" disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Settings">
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {error && (
          <div className="flex items-start gap-2 text-sm text-[var(--destructive)] bg-[rgba(255,59,48,0.08)] rounded-xl px-3 py-3 mb-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Connection error</p>
              <p className="text-xs mt-0.5 text-[var(--fg2)]">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-[var(--card)] rounded-2xl overflow-hidden divide-y divide-[var(--border)]">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <Skeleton className="h-4 flex-1 max-w-[200px]" />
              </div>
            ))}
          </div>
        ) : databases.length === 0 && !error ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-[var(--fg2)] font-medium">No databases found</p>
            <p className="text-sm text-[var(--fg3)]">
              Make sure your Notion integration has access to at least one database.
            </p>
            <Button variant="ghost" onClick={onRefresh} className="mt-2">
              Try again
            </Button>
          </div>
        ) : (
          <div className="bg-[var(--card)] rounded-2xl overflow-hidden">
            {databases.map((db, i) => (
              <button
                key={db.id}
                onClick={() => onSelect(db)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface2)] active:bg-[var(--surface2)] transition-colors text-left ${
                  i < databases.length - 1 ? 'border-b border-[var(--border)]' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-lg shrink-0">
                  {db.icon ?? '📋'}
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--fg)] truncate">
                  {db.title}
                </span>
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="text-[var(--fg3)] shrink-0">
                  <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
