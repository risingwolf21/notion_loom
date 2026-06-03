import { RefreshCw, Settings, Database, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { Tooltip } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
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
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-background border-b border-border">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-foreground">My Lists</h1>
          {!loading && databases.length > 0 && (
            <Badge variant="secondary">{databases.length}</Badge>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip content="Refresh" side="bottom">
            <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh" disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </Button>
          </Tooltip>
          <Tooltip content="Settings" side="bottom">
            <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Settings">
              <Settings size={16} />
            </Button>
          </Tooltip>
        </div>
      </div>

      <Separator />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {error && (
          <Alert variant="destructive" title="Connection error" className="mb-4">{error}</Alert>
        )}

        {loading ? (
          <Card className="overflow-hidden p-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}
              >
                <Skeleton className="size-8 rounded-md shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-2.5 w-1/4" />
                </div>
              </div>
            ))}
          </Card>
        ) : databases.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div className="size-12 rounded-lg bg-secondary flex items-center justify-center">
              <Database size={22} className="text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">No databases found</p>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Make sure your Notion integration has access to at least one database.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Try again
            </Button>
          </div>
        ) : (
          <Card className="overflow-hidden p-0">
            {databases.map((db, i) => (
              <button
                key={db.id}
                onClick={() => onSelect(db)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left ${
                  i < databases.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="size-8 rounded-md bg-secondary flex items-center justify-center text-base shrink-0">
                  {db.icon ?? '📋'}
                </div>
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {db.title}
                </span>
                <ChevronRight size={14} className="text-muted-foreground shrink-0" />
              </button>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
