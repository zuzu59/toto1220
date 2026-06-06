import { readFileSync, writeFileSync } from 'node:fs'

const pkgPath = new URL('../package.json', import.meta.url)
const changelogPath = new URL('../CHANGELOG.md', import.meta.url)
const lockPath = new URL('../package-lock.json', import.meta.url)

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const [major, minor, patch] = String(pkg.version || '0.0.0').split('.').map(Number)
const nextVersion = `${major}.${minor}.${(patch || 0) + 1}`
const now = new Date()
const stamp = now.toISOString().replace('T', ' ').slice(0, 16)

pkg.version = nextVersion
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
lock.version = nextVersion
if (lock.packages?.['']) {
  lock.packages[''].version = nextVersion
}
writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`)

const changelog = readFileSync(changelogPath, 'utf8')
const entry = `## ${nextVersion} — ${stamp}\n- Bump automatique de version.\n- Release et changelog mis à jour par GitHub Actions.\n\n`
writeFileSync(changelogPath, changelog.replace('# Changelog\n\n', `# Changelog\n\n${entry}`))

console.log(nextVersion)
