import { db } from './db'
import { APP_VERSION } from '../constants'

function pad2(value) {
  return String(value).padStart(2, '0')
}

export function formatExportTimestamp(date = new Date()) {
  const year = pad2(date.getFullYear() % 100)
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())
  const hours = pad2(date.getHours())
  const minutes = pad2(date.getMinutes())
  return `${year}${month}${day}.${hours}${minutes}`
}

function csvEscape(value) {
  const text = value == null ? '' : String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export function stringifyCsv(rows) {
  return rows.map((row) => row.map(csvEscape).join(',')).join('\n')
}

export function parseCsv(text) {
  const rows = []
  let current = []
  let field = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        index += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === ',') {
      current.push(field)
      field = ''
      continue
    }

    if (char === '\n') {
      current.push(field)
      rows.push(current)
      current = []
      field = ''
      continue
    }

    if (char === '\r') {
      continue
    }

    field += char
  }

  if (field.length > 0 || current.length > 0) {
    current.push(field)
    rows.push(current)
  }

  return rows
}

export async function exportDatabaseCsv() {
  const [records, tags, settings] = await Promise.all([
    db.records.toArray(),
    db.tags.toArray(),
    db.settings.toArray()
  ])

  const rows = [['table', 'id', 'payload']]
  records.forEach((item) => rows.push(['record', item.id, JSON.stringify(item)]))
  tags.forEach((item) => rows.push(['tag', item.id, JSON.stringify(item)]))
  settings.forEach((item) => rows.push(['settings', item.id, JSON.stringify(item)]))
  return stringifyCsv(rows)
}

export async function importDatabaseCsv(csvText) {
  const rows = parseCsv(csvText)
  if (rows.length < 2) {
    throw new Error('CSV invalide')
  }

  const [, ...dataRows] = rows
  const records = []
  const tags = []
  const settings = []

  dataRows.forEach((row) => {
    const [table, _id, payload] = row
    if (!table || !payload) {
      return
    }

    const item = JSON.parse(payload)
    if (table === 'record') {
      records.push(item)
    } else if (table === 'tag') {
      tags.push(item)
    } else if (table === 'settings') {
      settings.push(item)
    }
  })

  await db.transaction('rw', db.records, db.tags, db.settings, async () => {
    await Promise.all([db.records.clear(), db.tags.clear(), db.settings.clear()])
    if (records.length) await db.records.bulkPut(records)
    if (tags.length) await db.tags.bulkPut(tags)
    if (settings.length) await db.settings.bulkPut(settings)
  })
}

export function exportConfigJson(settings) {
  return JSON.stringify(
    {
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      settings
    },
    null,
    2
  )
}

export async function importConfigJson(jsonText) {
  const parsed = JSON.parse(jsonText)
  if (!parsed?.settings) {
    throw new Error('Configuration invalide')
  }

  await db.settings.put({ ...parsed.settings, id: 1 })
}
