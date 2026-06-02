import { RefreshCw, AlertCircle, Settings, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
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
        <h1 className="text-xl font-bold text-[var(--fg)]">My Lists</h1>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh" disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Settings">
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {error && (
          <div className="flex items-start gap-2.5 text-sm text-[var(--destructive)] bg-[rgba(255,59,48,0.08)] rounded-xl px-4 py-3 mb-4 border border-[rgba(255,59,48,0.15)]">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Connection error</p>
              <p className="text-xs mt-0.5 text-[var(--fg2)]">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <Card className="overflow-hidden divide-y divide-[var(--border)]">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
              </div>
            ))}
          </Card>
        ) : databases.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface2)] flex items-center justify-center">
              <Database size={22} className="text-[var(--fg3)]" />
            </div>
            <div>
              <p className="text-[var(--fg2)] font-medium text-sm">No databases found</p>
              <p className="text-xs text-[var(--fg3)] mt-1 leading-relaxed">
                Make sure your Notion integration has access to at least one database.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh} className="mt-1">
              Try again
            </Button>
          </div>
        ) : (
          <Card className="overflow-hidden">
            {databases.map((db, i) => (
              <button
                key={db.id}
                onClick={() => onSelect(db)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface2)] active:bg-[var(--surface2)] transition-colors text-left ${
                  i < databases.length - 1 ? 'border-b border-[var(--border)]' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--primary-light)] flex items-center justify-center text-lg shrink-0">
                  {db.icon ?? '📋'}
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--fg)] truncate">
                  {db.title}
                </span>
                <svg width="6" height="11" viewBox="0 0 6 11" fill="none" className="text-[var(--fg3)] shrink-0">
                  <path d="M1 1l4 4.5-4 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
