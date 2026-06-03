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
  | { type: 'multi_select'; multi_select: Array<{ id: string; name: string; color: string }> }

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
  dueDate: string | null    // YYYY-MM-DD
  dueTime: string | null    // HH:mm
  description: string | null
  location: string | null
  tags: string[]
  createdTime: string
}

export interface DatabaseMeta {
  titleProp: string
  checkboxProp: string | null
  dateProp: string | null
  descriptionProp: string | null
  locationProp: string | null
  tagsProp: string | null
}
