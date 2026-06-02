import type { NotionDatabase, NotionPage, Task, DatabaseMeta } from '@/types/notion'

export function detectDatabaseMeta(database: NotionDatabase): DatabaseMeta {
  const props = Object.values(database.properties)
  return {
    titleProp:    props.find((p) => p.type === 'title')?.name    ?? 'Name',
    checkboxProp: props.find((p) => p.type === 'checkbox')?.name ?? null,
    dateProp:     props.find((p) => p.type === 'date')?.name     ?? null,
  }
}

export function pageToTask(page: NotionPage, meta: DatabaseMeta): Task {
  const titleProp = page.properties[meta.titleProp]
  const title =
    titleProp?.type === 'title'
      ? titleProp.title.map((t) => t.plain_text).join('')
      : 'Untitled'

  const checkboxProp = meta.checkboxProp ? page.properties[meta.checkboxProp] : null
  const done = checkboxProp?.type === 'checkbox' ? checkboxProp.checkbox : false

  const dateProp = meta.dateProp ? page.properties[meta.dateProp] : null
  const dueDate = dateProp?.type === 'date' && dateProp.date ? dateProp.date.start : null

  return { id: page.id, title, done, dueDate, createdTime: page.created_time }
}
