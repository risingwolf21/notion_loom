import { useState } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { useNotionDatabases } from '@/hooks/useNotionDatabases'
import { useTaskList } from '@/hooks/useTaskList'
import { useAllTasks } from '@/hooks/useAllTasks'
import { Onboarding } from '@/components/Onboarding'
import { DatabasePicker } from '@/components/DatabasePicker'
import { TaskList } from '@/components/TaskList'
import { SmartListView } from '@/components/SmartListView'
import { SettingsSheet } from '@/components/SettingsSheet'
import type { Settings } from '@/hooks/useSettings'
import type { NotionDatabase } from '@/types/notion'
import type { SmartFilter } from '@/hooks/useAllTasks'

type View =
  | { name: 'onboarding' }
  | { name: 'databases' }
  | { name: 'tasks'; database: NotionDatabase }
  | { name: 'smart'; filter: SmartFilter }

function TasksView({
  settings,
  database,
  onBack,
  onSettings,
}: {
  settings: Settings
  database: NotionDatabase
  onBack: () => void
  onSettings: () => void
}) {
  const {
    tasks, visibleTasks, meta, loading, error,
    filter, setFilter,
    toggleTask, addTask, deleteTask, reorderTasks, refresh,
  } = useTaskList(database, settings)

  return (
    <TaskList
      database={database}
      tasks={tasks}
      visibleTasks={visibleTasks}
      meta={meta}
      loading={loading}
      error={error}
      filter={filter}
      onBack={onBack}
      onSettings={onSettings}
      onToggleTask={toggleTask}
      onDeleteTask={deleteTask}
      onAddTask={addTask}
      onReorder={reorderTasks}
      onFilterChange={setFilter}
      onRefresh={refresh}
    />
  )
}

export default function App() {
  const { settings, saveSettings, clearAll, isConfigured } = useSettings()
  const [view, setView] = useState<View>(
    isConfigured ? { name: 'databases' } : { name: 'onboarding' },
  )
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { databases, loading: dbLoading, error: dbError, refresh: refreshDbs } =
    useNotionDatabases(settings)

  const { counts, filterTasks, toggleTask, deleteTask, loading: allLoading, error: allError, refresh: refreshAll } =
    useAllTasks(databases, settings)

  function handleRefresh() {
    refreshDbs()
    refreshAll()
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {view.name === 'onboarding' && (
        <Onboarding
          onComplete={(s) => {
            saveSettings(s)
            setView({ name: 'databases' })
          }}
        />
      )}

      {view.name === 'databases' && (
        <DatabasePicker
          databases={databases}
          loading={dbLoading}
          error={dbError}
          counts={counts}
          countsLoading={allLoading}
          onSelect={(db) => setView({ name: 'tasks', database: db })}
          onSmartCard={(filter) => setView({ name: 'smart', filter })}
          onRefresh={handleRefresh}
          onSettings={() => setSettingsOpen(true)}
        />
      )}

      {view.name === 'tasks' && (
        <TasksView
          settings={settings}
          database={view.database}
          onBack={() => setView({ name: 'databases' })}
          onSettings={() => setSettingsOpen(true)}
        />
      )}

      {view.name === 'smart' && (
        <SmartListView
          filter={view.filter}
          tasks={filterTasks(view.filter)}
          loading={allLoading}
          error={allError}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onBack={() => setView({ name: 'databases' })}
          onRefresh={refreshAll}
        />
      )}

      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={(s) => {
          saveSettings(s)
          setView({ name: 'databases' })
        }}
        onClear={clearAll}
      />
    </div>
  )
}
