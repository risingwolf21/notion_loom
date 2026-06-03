import {
  RefreshCw, Settings, Database, ChevronRight,
  Sun, CalendarDays, Layers, Star, Flame, CheckCircle2, Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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

const SMART_CARDS = [
  { label: 'Due Today', icon: Sun,          bg: 'bg-blue-500'   },
  { label: 'Planned',   icon: CalendarDays, bg: 'bg-orange-500' },
  { label: 'All',       icon: Layers,       bg: 'bg-zinc-500'   },
  { label: 'Marked',    icon: Star,         bg: 'bg-yellow-500' },
  { label: 'Urgent',    icon: Flame,        bg: 'bg-red-500'    },
  { label: 'Done',      icon: CheckCircle2, bg: 'bg-green-500'  },
] as const

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

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {error && (
          <Alert variant="destructive" title="Connection error" className="mb-2">{error}</Alert>
        )}

        {/* Smart list cards */}
        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {SMART_CARDS.map(({ label, icon: Icon, bg }) => (
              <button
                key={label}
                className={`${bg} rounded-2xl p-4 aspect-square flex flex-col justify-between text-left transition-opacity active:opacity-75`}
              >
                <div className="flex items-start justify-between">
                  <Icon size={26} className="text-white/90" strokeWidth={2} />
                  <span className="text-white text-2xl font-bold leading-none tabular-nums">0</span>
                </div>
                <span className="text-white font-semibold text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Reminders — full width */}
          <button className="w-full bg-purple-500 rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left transition-opacity active:opacity-75">
            <Bell size={26} className="text-white/90 shrink-0" strokeWidth={2} />
            <span className="flex-1 text-white font-semibold text-sm">Reminders</span>
            <span className="text-white text-2xl font-bold leading-none tabular-nums">0</span>
          </button>
        </section>

        {/* My Lists */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3 px-0.5">My Lists</h2>

          {loading ? (
            <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden bg-card">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <Skeleton className="size-8 rounded-md shrink-0" />
                  <Skeleton className="h-3.5 flex-1" />
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
        </section>
      </div>
    </div>
  )
}
