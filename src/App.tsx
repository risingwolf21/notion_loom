import { useState } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { useNotionDatabases } from '@/hooks/useNotionDatabases'
import { useTaskList } from '@/hooks/useTaskList'
import { Onboarding } from '@/components/Onboarding'
import { DatabasePicker } from '@/components/DatabasePicker'
import { TaskList } from '@/components/TaskList'
import { SettingsSheet } from '@/components/SettingsSheet'
import type { Settings } from '@/hooks/useSettings'
import type { NotionDatabase } from '@/types/notion'

type View =
  | { name: 'onboarding' }
  | { name: 'databases' }
  | { name: 'tasks'; database: NotionDatabase }

function DatabasesView({
  settings,
  onSelect,
  onSettings,
}: {
  settings: Settings
  onSelect: (db: NotionDatabase) => void
  onSettings: () => void
}) {
  const { databases, loading, error, refresh } = useNotionDatabases(settings)

  return (
    <DatabasePicker
      databases={databases}
      loading={loading}
      error={error}
      onSelect={onSelect}
      onRefresh={refresh}
      onSettings={onSettings}
    />
  )
}

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
        <DatabasesView
          settings={settings}
          onSelect={(db) => setView({ name: 'tasks', database: db })}
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
