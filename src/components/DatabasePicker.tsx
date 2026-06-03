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
  Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle,
} from '@/components/ui/empty'
import {
  Item, ItemActions, ItemContent, ItemGroup, ItemMedia, ItemTitle,
} from '@/components/ui/item'
import type { NotionDatabase } from '@/types/notion'
import type { SmartFilter, SmartCounts } from '@/hooks/useAllTasks'

interface Props {
  databases: NotionDatabase[]
  loading: boolean
  error: string | null
  counts: SmartCounts
  countsLoading: boolean
  onSelect: (db: NotionDatabase) => void
  onSmartCard: (filter: SmartFilter) => void
  onRefresh: () => void
  onSettings: () => void
}

export function DatabasePicker({
  databases, loading, error, counts, countsLoading,
  onSelect, onSmartCard, onRefresh, onSettings,
}: Props) {
  const remindersDb = databases.find((db) => db.title.toLowerCase() === 'reminders')

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
            {[
              { filter: 'today'   as SmartFilter, label: 'Due Today', icon: Sun,          bg: 'bg-blue-500',   count: counts.today,   active: true  },
              { filter: 'planned' as SmartFilter, label: 'Planned',   icon: CalendarDays, bg: 'bg-orange-500', count: counts.planned, active: true  },
              { filter: 'all'     as SmartFilter, label: 'All',       icon: Layers,       bg: 'bg-zinc-500',   count: counts.all,     active: true  },
              { filter: null,                     label: 'Marked',    icon: Star,         bg: 'bg-yellow-500', count: 0,              active: false },
              { filter: null,                     label: 'Urgent',    icon: Flame,        bg: 'bg-red-500',    count: 0,              active: false },
              { filter: 'done'    as SmartFilter, label: 'Done',      icon: CheckCircle2, bg: 'bg-green-500',  count: counts.done,    active: true  },
            ].map(({ filter, label, icon: Icon, bg, count, active }) => (
              <button
                key={label}
                onClick={() => filter && onSmartCard(filter)}
                disabled={!active}
                className={`${bg} rounded-2xl p-4 aspect-square flex flex-col justify-between text-left transition-opacity active:opacity-75 ${active ? 'hover:opacity-90' : 'opacity-40 cursor-default'}`}
              >
                <div className="flex items-start justify-between">
                  <Icon size={26} className="text-white/90" strokeWidth={2} />
                  <span className="text-white text-2xl font-bold leading-none tabular-nums">
                    {active ? (countsLoading ? '·' : count) : '—'}
                  </span>
                </div>
                <span className="text-white font-semibold text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Reminders — full width, opens the "Reminders" database */}
          <button
            onClick={() => remindersDb ? onSelect(remindersDb) : undefined}
            disabled={!remindersDb}
            className={`w-full bg-purple-500 rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left transition-opacity active:opacity-75 ${remindersDb ? 'hover:opacity-90' : 'opacity-40 cursor-default'}`}
          >
            <Bell size={26} className="text-white/90 shrink-0" strokeWidth={2} />
            <span className="flex-1 text-white font-semibold text-sm">Reminders</span>
            <span className="text-white text-2xl font-bold leading-none tabular-nums">
              {countsLoading ? '·' : counts.reminders}
            </span>
          </button>
        </section>

        {/* My Lists */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-3 px-0.5">My Lists</h2>

          {loading ? (
            <div className="rounded-xl ring-1 ring-foreground/10 overflow-hidden bg-card">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                  <Skeleton className="size-8 rounded-md shrink-0" />
                  <Skeleton className="h-3.5 flex-1" />
                </div>
              ))}
            </div>
          ) : databases.length === 0 && !error ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon"><Database size={20} /></EmptyMedia>
                <EmptyTitle>No databases found</EmptyTitle>
                <EmptyDescription>
                  Make sure your Notion integration has access to at least one database.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" size="sm" onClick={onRefresh}>Try again</Button>
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
