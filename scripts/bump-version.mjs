import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const pkgPath = new URL('../package.json', import.meta.url)
const changelogPath = new URL('../CHANGELOG.md', import.meta.url)
const lockPath = new URL('../package-lock.json', import.meta.url)

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const [major, minor, patch] = String(pkg.version || '0.0.0').split('.').map(Number)
const nextVersion = `${major}.${minor}.${(patch || 0) + 1}`
const now = new Date()
const stamp = now.toISOString().replace('T', ' ').slice(0, 16)

function getPreviousTag() {
  try {
    return execFileSync('git', ['describe', '--tags', '--abbrev=0', 'HEAD^'], { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

function getCommitSubjects(range) {
  if (!range) {
    return [
      'Base PWA mobile-first pour gérer les services.',
      'CRUD records + tags.',
      'Recherche full-text AND.',
      'Chiffrement AES-GCM avec PBKDF2/SHA-256.',
      'Import/export CSV et config JSON.'
    ]
  }

  const output = execFileSync('git', ['log', '--reverse', '--format=%s', '--no-merges', range], { encoding: 'utf8' }).trim()
  return output
    ? output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !/^change:\s*bump version/i.test(line))
    : []
}

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
const subjects = getCommitSubjects(range)
const bullets = subjects.length ? subjects.map((subject) => `- ${subject}`).join('\n') : '- Mise à jour de maintenance.'

const changelog = readFileSync(changelogPath, 'utf8')
const entry = `## ${nextVersion} — ${stamp}\n${bullets}\n\n`
writeFileSync(changelogPath, changelog.replace('# Changelog\n\n', `# Changelog\n\n${entry}`))

console.log(nextVersion)
