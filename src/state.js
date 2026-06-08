import { reactive } from 'vue'
import { db, ensureSeedData, getSettingsRow, putSettingsRow } from './services/db'
import { APP_VERSION } from './constants'
import { base64ToBytes, bytesToBase64, decryptText, deriveAesKey, encryptText, encodeSecret, randomBytes, wipeBytes } from './services/crypto'

const SECRET_FIELDS = ['ssh1Password', 'ssh2Password', 'html1Password', 'html2Password']

function cloneSecretPayload(payload) {
  if (!payload) return null
  return {
    iv: payload.iv,
    data: payload.data
  }
}

export const state = reactive({
  ready: false,
  loading: true,
  records: [],
  tags: [],
  settings: null,
  query: '',
  sortBy: 'modifiedAt',
  sortDir: 'desc',
  page: 1,
  pageSize: 10,
  drawerOpen: false,
  unlocked: false,
  unlockUntil: 0,
  latestRelease: null,
  latestReleaseError: '',
  notice: '',
  error: ''
})

let masterKey = null
let lockTicker = null

function now() {
  return Date.now()
}

function refreshUnlockTimer() {
  if (!state.settings) return
  state.unlockUntil = now() + state.settings.lockMinutes * 60 * 1000
}

function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeRecord(record) {
  return {
    id: record?.id,
    serviceName: record?.serviceName || '',
    ip: record?.ip || '',
    url: record?.url || '',
    description: record?.description || '',
    tagIds: [...ensureArray(record?.tagIds)],
    ssh1String: record?.ssh1String || '',
    ssh1User: record?.ssh1User || '',
    ssh1Password: record?.ssh1Password || null,
    ssh2String: record?.ssh2String || '',
    ssh2User: record?.ssh2User || '',
    ssh2Password: record?.ssh2Password || null,
    html1String: record?.html1String || '',
    html1User: record?.html1User || '',
    html1Password: record?.html1Password || null,
    html2String: record?.html2String || '',
    html2User: record?.html2User || '',
    html2Password: record?.html2Password || null,
    note: record?.note || '',
    createdAt: record?.createdAt || now(),
    modifiedAt: record?.modifiedAt || now()
  }
}

function normalizeTag(tag) {
  return {
    id: tag?.id,
    name: tag?.name || '',
    color: tag?.color || '#38bdf8',
    slug: tag?.slug || (tag?.name || '').toLowerCase().trim().replace(/\s+/g, '-')
  }
}

export function getTagName(tagId) {
  return state.tags.find((tag) => tag.id === tagId)?.name || ''
}

export function getRecordTags(record) {
  return ensureArray(record?.tagIds)
    .map((tagId) => state.tags.find((tag) => tag.id === tagId))
    .filter(Boolean)
}

export async function loadApp() {
  state.loading = true
  state.error = ''
  await ensureSeedData()
  state.settings = await getSettingsRow()
  if (!state.settings.masterSalt) {
    const salt = randomBytes(16)
    state.settings.masterSalt = bytesToBase64(salt)
    state.settings.updatedAt = now()
    await putSettingsRow(state.settings)
    wipeBytes(salt)
  }
  const [records, tags] = await Promise.all([db.records.toArray(), db.tags.toArray()])
  state.records = records.map(normalizeRecord)
  state.tags = tags.map(normalizeTag)
  state.loading = false
  state.ready = true
}

export async function saveSettings(patch) {
  state.settings = { ...state.settings, ...patch, updatedAt: now() }
  await putSettingsRow(state.settings)
  refreshUnlockTimer()
}

export async function updateSettings(patch) {
  await saveSettings(patch)
}

export async function unlockApp(passphrase) {
  if (!state.settings?.masterSalt) {
    throw new Error('Salt manquant')
  }

  const passBytes = encodeSecret(passphrase)
  const saltBytes = base64ToBytes(state.settings.masterSalt)
  try {
    masterKey = await deriveAesKey(passBytes, saltBytes)
    state.unlocked = true
    refreshUnlockTimer()
    state.notice = 'Application déverrouillée'
  } finally {
    wipeBytes(passBytes)
    wipeBytes(saltBytes)
  }
}

export function lockApp(reason = 'Application verrouillée') {
  masterKey = null
  state.unlocked = false
  state.unlockUntil = 0
  state.notice = reason
}

export function touchActivity() {
  if (state.unlocked) {
    refreshUnlockTimer()
  }
}

export function startAutoLockMonitor() {
  if (lockTicker) return
  lockTicker = window.setInterval(() => {
    if (state.unlocked && now() > state.unlockUntil) {
      lockApp('Application verrouillée automatiquement')
    }
  }, 15000)
}

export function stopAutoLockMonitor() {
  if (lockTicker) {
    clearInterval(lockTicker)
    lockTicker = null
  }
}

async function encryptIfNeeded(value) {
  if (!value) return null
  if (!masterKey) throw new Error('Déverrouillez l’application pour enregistrer des mots de passe')
  return encryptText(masterKey, value)
}

async function decryptIfNeeded(payload) {
  if (!payload) return ''
  if (!masterKey) return ''
  return decryptText(masterKey, payload)
}

export function getSecretPayloads(record) {
  const item = normalizeRecord(record)
  return {
    ssh1Password: cloneSecretPayload(item.ssh1Password),
    ssh2Password: cloneSecretPayload(item.ssh2Password),
    html1Password: cloneSecretPayload(item.html1Password),
    html2Password: cloneSecretPayload(item.html2Password)
  }
}

export async function prepareRecordForForm(record) {
  const item = normalizeRecord(record)
  if (!state.unlocked) {
    return item
  }

  const decrypted = { ...item }
  decrypted.ssh1Password = await decryptIfNeeded(item.ssh1Password)
  decrypted.ssh2Password = await decryptIfNeeded(item.ssh2Password)
  decrypted.html1Password = await decryptIfNeeded(item.html1Password)
  decrypted.html2Password = await decryptIfNeeded(item.html2Password)
  return decrypted
}

export async function saveRecord(form, previousSecrets = {}) {
  const payload = normalizeRecord(form)
  const record = {
    ...payload,
    ssh1Password: state.unlocked ? await encryptIfNeeded(form.ssh1Password) : cloneSecretPayload(previousSecrets.ssh1Password),
    ssh2Password: state.unlocked ? await encryptIfNeeded(form.ssh2Password) : cloneSecretPayload(previousSecrets.ssh2Password),
    html1Password: state.unlocked ? await encryptIfNeeded(form.html1Password) : cloneSecretPayload(previousSecrets.html1Password),
    html2Password: state.unlocked ? await encryptIfNeeded(form.html2Password) : cloneSecretPayload(previousSecrets.html2Password),
    modifiedAt: now()
  }

  if (!record.createdAt) {
    record.createdAt = now()
  }

  if (record.id) {
    await db.records.put(record)
    state.records = state.records.map((item) => (item.id === record.id ? normalizeRecord(record) : item))
  } else {
    delete record.id
    const id = await db.records.add(record)
    state.records = [...state.records, normalizeRecord({ ...record, id })]
    record.id = id
  }

  return record
}

export async function deleteRecord(id) {
  await db.records.delete(id)
  state.records = state.records.filter((record) => record.id !== id)
}

export async function saveTag(form) {
  const tag = normalizeTag(form)
  if (!tag.name.trim()) {
    throw new Error('Le nom du tag est requis')
  }
  if (tag.id) {
    await db.tags.put(tag)
    state.tags = state.tags.map((item) => (item.id === tag.id ? tag : item))
  } else {
    delete tag.id
    const id = await db.tags.add(tag)
    state.tags = [...state.tags, { ...tag, id }]
  }
}

export async function deleteTag(id) {
  await db.tags.delete(id)
  await db.records.toCollection().modify((record) => {
    record.tagIds = ensureArray(record.tagIds).filter((tagId) => tagId !== id)
  })
  state.tags = state.tags.filter((tag) => tag.id !== id)
  state.records = state.records.map((record) => ({
    ...record,
    tagIds: ensureArray(record.tagIds).filter((tagId) => tagId !== id)
  }))
}

export function exportableState() {
  return {
    settings: state.settings,
    tags: state.tags,
    records: state.records
  }
}

export function isUnlocked() {
  return state.unlocked && now() < state.unlockUntil
}

export async function resetAndImportDatabase(importer) {
  lockApp()
  await importer()
  await loadApp()
}

export function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value))
}

export function sortRecords(records, sortBy, sortDir) {
  const direction = sortDir === 'asc' ? 1 : -1
  return [...records].sort((left, right) => {
    const a = left?.[sortBy] ?? ''
    const b = right?.[sortBy] ?? ''
    if (a < b) return -1 * direction
    if (a > b) return 1 * direction
    return 0
  })
}

export function searchRecords(records, query, tags) {
  const terms = String(query || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  if (!terms.length) return records

  return records.filter((record) => {
    const tagText = getRecordTags(record)
      .map((tag) => tag.name)
      .join(' ')
      .toLowerCase()
    const values = [
      record.serviceName,
      record.ip,
      record.url,
      record.description,
      tagText,
      record.ssh1String,
      record.ssh2String,
      record.html1String,
      record.html2String,
      record.note,
      formatDate(record.createdAt),
      formatDate(record.modifiedAt)
    ]
      .join(' ')
      .toLowerCase()

    return terms.every((term) => values.includes(term))
  })
}

export function getVersion() {
  return APP_VERSION
}
