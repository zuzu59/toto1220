import { readFileSync, writeFileSync } from 'node:fs'
import { buildReleaseEntry, getCommits, getPreviousTag, insertReleaseEntry } from './changelog-utils.mjs'

const pkgPath = new URL('../package.json', import.meta.url)
const changelogPath = new URL('../CHANGELOG.md', import.meta.url)
const lockPath = new URL('../package-lock.json', import.meta.url)

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const [major, minor, patch] = String(pkg.version || '0.0.0').split('.').map(Number)
const nextVersion = `${major}.${minor}.${(patch || 0) + 1}`
const now = new Date()
const stamp = now.toISOString().replace('T', ' ').slice(0, 10)

pkg.version = nextVersion
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
lock.version = nextVersion
if (lock.packages?.['']) {
  lock.packages[''].version = nextVersion
}
writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`)

const previousTag = getPreviousTag()
const range = previousTag ? `${previousTag}..HEAD` : ''
const commits = getCommits(range)
const entry = buildReleaseEntry(nextVersion, stamp, commits.length ? commits : [{ subject: 'Mise à jour de maintenance.', body: '' }])
const changelog = readFileSync(changelogPath, 'utf8')
writeFileSync(changelogPath, `${insertReleaseEntry(changelog, entry)}\n`)
writeFileSync(new URL('../RELEASE_NOTES.md', import.meta.url), `${entry}\n`)

console.log(nextVersion)
