import type { NotionDatabase, NotionPage } from '@/types/notion'

export class NotionAPIError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'NotionAPIError'
    this.status = status
  }
}

async function notionFetch<T>(
  workerUrl: string,
  token: string,
  path: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const base = workerUrl.replace(/\/$/, '')
  const url = `${base}${path}`

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { message?: string }
    throw new NotionAPIError(response.status, data.message ?? `HTTP ${response.status}`)
  }

  return response.json() as Promise<T>
}

interface ListResponse<T> {
  results: T[]
  has_more: boolean
  next_cursor: string | null
}

interface RawDatabase {
  id: string
  title: Array<{ plain_text: string }>
  icon: { type: string; emoji?: string } | null
  properties: Record<string, { id: string; name: string; type: string }>
  url: string
}

export async function listDatabases(
  workerUrl: string,
  token: string,
): Promise<NotionDatabase[]> {
  const data = await notionFetch<ListResponse<RawDatabase>>(
    workerUrl, token, '/v1/search', 'POST',
    {
      filter: { property: 'object', value: 'database' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' },
      page_size: 100,
    },
  )

  return data.results.map((db) => ({
    id: db.id,
    title: db.title.map((t) => t.plain_text).join('') || 'Untitled',
    icon: db.icon?.emoji ?? null,
    properties: Object.fromEntries(
      Object.values(db.properties).map((p) => [
        p.name,
        { id: p.id, name: p.name, type: p.type as NotionDatabase['properties'][string]['type'] },
      ]),
    ),
    url: db.url,
  }))
}

export async function queryDatabase(
  workerUrl: string,
  token: string,
  databaseId: string,
): Promise<NotionPage[]> {
  const pages: NotionPage[] = []
  let cursor: string | undefined

  do {
    const data = await notionFetch<ListResponse<NotionPage>>(
      workerUrl, token,
      `/v1/databases/${databaseId}/query`, 'POST',
      { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
    )
    pages.push(...data.results)
    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined
  } while (cursor)

  return pages
}

export interface TaskFields {
  title: string
  dueDate?: string    // YYYY-MM-DD
  dueTime?: string    // HH:mm
  description?: string
  location?: string
  tags?: string[]
}

export async function createPage(
  workerUrl: string,
  token: string,
  databaseId: string,
  meta: { titleProp: string; checkboxProp?: string | null; dateProp?: string | null; descriptionProp?: string | null; locationProp?: string | null; tagsProp?: string | null },
  fields: TaskFields,
): Promise<NotionPage> {
  const properties: Record<string, unknown> = {
    [meta.titleProp]: { title: [{ text: { content: fields.title } }] },
  }

  if (meta.checkboxProp) {
    properties[meta.checkboxProp] = { checkbox: false }
  }
  if (meta.dateProp && fields.dueDate) {
    const start = fields.dueTime ? `${fields.dueDate}T${fields.dueTime}:00` : fields.dueDate
    properties[meta.dateProp] = { date: { start } }
  }
  if (meta.descriptionProp && fields.description) {
    properties[meta.descriptionProp] = { rich_text: [{ text: { content: fields.description } }] }
  }
  if (meta.locationProp && fields.location) {
    properties[meta.locationProp] = { rich_text: [{ text: { content: fields.location } }] }
  }
  if (meta.tagsProp && fields.tags?.length) {
    properties[meta.tagsProp] = { multi_select: fields.tags.map((name) => ({ name })) }
  }

  return notionFetch<NotionPage>(workerUrl, token, '/v1/pages', 'POST', {
    parent: { database_id: databaseId },
    properties,
  })
}

export async function updatePage(
  workerUrl: string,
  token: string,
  pageId: string,
  updates: {
    titlePropName?: string
    title?: string
    checkboxPropName?: string
    checked?: boolean
    datePropName?: string
    dueDate?: string | null
  },
): Promise<NotionPage> {
  const properties: Record<string, unknown> = {}

  if (updates.titlePropName !== undefined && updates.title !== undefined) {
    properties[updates.titlePropName] = {
      title: [{ text: { content: updates.title } }],
    }
  }
  if (updates.checkboxPropName !== undefined && updates.checked !== undefined) {
    properties[updates.checkboxPropName] = { checkbox: updates.checked }
  }
  if (updates.datePropName !== undefined && updates.dueDate !== undefined) {
    properties[updates.datePropName] = {
      date: updates.dueDate ? { start: updates.dueDate } : null,
    }
  }

  return notionFetch<NotionPage>(workerUrl, token, `/v1/pages/${pageId}`, 'PATCH', {
    properties,
  })
}

export async function archivePage(
  workerUrl: string,
  token: string,
  pageId: string,
): Promise<void> {
  await notionFetch(workerUrl, token, `/v1/pages/${pageId}`, 'PATCH', {
    archived: true,
  })
}

export async function validateConnection(
  workerUrl: string,
  token: string,
): Promise<void> {
  await notionFetch(workerUrl, token, '/v1/users/me', 'GET')
}
