import { RefreshCw, Settings, Database, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert } from '@/components/ui/alert'
import { Tooltip } from '@/components/ui/tooltip'
import { AppBar } from '@/components/ui/appbar'
import { Spinner } from '@/components/ui/spinner'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
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
      <AppBar
        title="My Lists"
        withScrollEffect={false}
        actions={
          <>
            {!loading && databases.length > 0 && (
              <Badge variant="secondary">{databases.length}</Badge>
            )}
            <Tooltip content="Refresh" side="bottom">
              <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh" disabled={loading}>
                {loading ? <Spinner /> : <RefreshCw size={16} />}
              </Button>
            </Tooltip>
            <Tooltip content="Settings" side="bottom">
              <Button variant="ghost" size="icon" onClick={onSettings} aria-label="Settings">
                <Settings size={16} />
              </Button>
            </Tooltip>
          </>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {error && (
          <Alert variant="destructive" title="Connection error" className="mb-4">{error}</Alert>
        )}

        {loading ? (
          <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden bg-card">
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
          </div>
        ) : databases.length === 0 && !error ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Database size={20} />
              </EmptyMedia>
              <EmptyTitle>No databases found</EmptyTitle>
              <EmptyDescription>
                Make sure your Notion integration has access to at least one database.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" onClick={onRefresh}>
                Try again
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <ItemGroup>
            {databases.map((db) => (
              <Item
                key={db.id}
                render={<button onClick={() => onSelect(db)} />}
                variant="outline"
              >
                <ItemMedia variant="icon">
                  <span className="text-base leading-none">{db.icon ?? '📋'}</span>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{db.title}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}
      </div>
    </div>
  )
}
