import Dexie from 'dexie'

export const db = new Dexie('z-services')

db.version(1).stores({
  records: '++id, serviceName, ip, url, modifiedAt, createdAt',
  tags: '++id, name, slug',
  settings: 'id'
})

export async function getSettingsRow() {
  return db.settings.get(1)
}

export async function putSettingsRow(settings) {
  return db.settings.put({ ...settings, id: 1 })
}

export async function ensureSeedData() {
  const settings = await getSettingsRow()
  if (!settings) {
    await putSettingsRow({
      lockMinutes: 10,
      theme: 'dark',
      masterSalt: null,
      githubUser: 'zuzu59',
      githubRepo: 'z-services',
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
  }
}
