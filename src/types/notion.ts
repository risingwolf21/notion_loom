export type NotionPropertyType =
  | 'title' | 'checkbox' | 'date' | 'rich_text' | 'select'
  | 'multi_select' | 'number' | 'url' | 'email' | 'phone_number'
  | 'created_time' | 'last_edited_time' | 'status' | 'people'
  | 'formula' | 'relation' | 'rollup' | 'files'

export interface NotionPropertySchema {
  id: string
  name: string
  type: NotionPropertyType
}

export interface NotionDatabase {
  id: string
  title: string
  icon: string | null
  properties: Record<string, NotionPropertySchema>
  url: string
}

export interface NotionTextContent {
  plain_text: string
}

export type NotionPropertyValue =
  | { type: 'title'; title: NotionTextContent[] }
  | { type: 'checkbox'; checkbox: boolean }
  | { type: 'date'; date: { start: string; end: string | null } | null }
  | { type: 'rich_text'; rich_text: NotionTextContent[] }
  | { type: 'select'; select: { name: string; color: string } | null }
  | { type: 'status'; status: { name: string; color: string } | null }

export interface NotionPage {
  id: string
  archived: boolean
  created_time: string
  last_edited_time: string
  properties: Record<string, NotionPropertyValue>
}

export interface Task {
  id: string
  title: string
  done: boolean
  dueDate: string | null
  createdTime: string
}

export interface DatabaseMeta {
  titleProp: string
  checkboxProp: string | null
  dateProp: string | null
}
