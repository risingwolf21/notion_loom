import { parseISO, format } from 'date-fns'
import type { NotionDatabase, NotionPage, Task, DatabaseMeta } from '@/types/notion'

const match = (name: string, ...patterns: RegExp[]) =>
  patterns.some((re) => re.test(name))

export function detectDatabaseMeta(database: NotionDatabase): DatabaseMeta {
  const props = Object.values(database.properties)

  const richText = (patterns: RegExp[]) =>
    props.find((p) => p.type === 'rich_text' && match(p.name, ...patterns))?.name ?? null

  const multiSelect = (patterns: RegExp[]) =>
    props.find((p) => p.type === 'multi_select' && match(p.name, ...patterns))?.name ?? null

  return {
    titleProp:       props.find((p) => p.type === 'title')?.name    ?? 'Name',
    checkboxProp:    props.find((p) => p.type === 'checkbox')?.name ?? null,
    dateProp:        props.find((p) => p.type === 'date')?.name     ?? null,
    descriptionProp: richText([/^description$/i, /^notes?$/i, /^details?$/i]),
    locationProp:    richText([/^location$/i, /^place$/i, /^address$/i]),
    tagsProp:        multiSelect([/^tags?$/i, /^labels?$/i, /^categor/i]),
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
  let dueDate: string | null = null
  let dueTime: string | null = null
  if (dateProp?.type === 'date' && dateProp.date) {
    const start = dateProp.date.start
    if (start.includes('T')) {
      const d = parseISO(start)
      dueDate = format(d, 'yyyy-MM-dd')
      dueTime = format(d, 'HH:mm')
    } else {
      dueDate = start
    }
  }

  const descProp = meta.descriptionProp ? page.properties[meta.descriptionProp] : null
  const description =
    descProp?.type === 'rich_text' && descProp.rich_text.length > 0
      ? descProp.rich_text.map((t) => t.plain_text).join('')
      : null

  const locProp = meta.locationProp ? page.properties[meta.locationProp] : null
  const location =
    locProp?.type === 'rich_text' && locProp.rich_text.length > 0
      ? locProp.rich_text.map((t) => t.plain_text).join('')
      : null

  const tagsProp = meta.tagsProp ? page.properties[meta.tagsProp] : null
  const tags =
    tagsProp?.type === 'multi_select'
      ? tagsProp.multi_select.map((t) => t.name)
      : []

  return {
    id: page.id,
    title,
    done,
    dueDate,
    dueTime,
    description,
    location,
    tags,
    createdTime: page.created_time,
  }
}
