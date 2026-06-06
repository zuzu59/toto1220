import { writeFileSync } from 'node:fs'
import { buildKeepAChangelog, buildReleaseEntry, getCommitSubjects, getTagDate, getVersionTags } from './changelog-utils.mjs'

const tags = getVersionTags().filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag))
const entries = []

for (let index = tags.length - 1; index >= 0; index -= 1) {
  const tag = tags[index]
  const previousTag = index > 0 ? tags[index - 1] : ''
  const range = previousTag ? `${previousTag}..${tag}` : `${tag}`
  const subjects = getCommitSubjects(range)
  const version = tag.replace(/^v/, '')
  const date = getTagDate(tag)
  entries.push(buildReleaseEntry(version, date, subjects.length ? subjects : ['Mise à jour de maintenance.']))
}

const changelog = buildKeepAChangelog(entries.join('\n'))
writeFileSync(new URL('../CHANGELOG.md', import.meta.url), `${changelog}\n`)
console.log('CHANGELOG.md regenerated')
