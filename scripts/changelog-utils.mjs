import { execFileSync } from 'node:child_process'

const PREFIX_TO_SECTION = new Map([
  ['new', 'Added'],
  ['change', 'Changed'],
  ['refact', 'Changed'],
  ['doc', 'Changed'],
  ['fixe', 'Fixed'],
  ['del', 'Removed']
])

export function getVersionTags() {
  const output = execFileSync('git', ['tag', '--list', '--sort=version:refname'], { encoding: 'utf8' }).trim()
  return output ? output.split('\n').filter(Boolean) : []
}

export function getTagDate(tag) {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs', tag], { encoding: 'utf8' }).trim()
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

export function getPreviousTag(tag, tags = getVersionTags()) {
  const index = tags.indexOf(tag)
  return index > 0 ? tags[index - 1] : ''
}

export function getCommitSubjects(range) {
  if (!range) {
    return []
  }

  const output = execFileSync('git', ['log', '--reverse', '--format=%s', '--no-merges', range], { encoding: 'utf8' }).trim()
  return output ? output.split('\n').map((line) => line.trim()).filter(Boolean) : []
}

export function classifySubject(subject) {
  const match = String(subject || '').match(/^(new|change|fixe|refact|doc|del)(\([^)]+\))?:\s*(.+)$/i)
  if (match) {
    const section = PREFIX_TO_SECTION.get(match[1].toLowerCase()) || 'Changed'
    return { section, text: `${match[1].toLowerCase()}${match[2] || ''}: ${match[3]}` }
  }

  return { section: 'Changed', text: String(subject || '').trim() }
}

export function buildReleaseEntry(version, date, subjects) {
  const sections = new Map()

  for (const subject of subjects) {
    if (/^change:\s*bump version/i.test(subject)) continue
    const { section, text } = classifySubject(subject)
    if (!sections.has(section)) sections.set(section, [])
    sections.get(section).push(text)
  }

  const order = ['Added', 'Changed', 'Fixed', 'Removed']
  const lines = [`## [${version}] - ${date}`]
  order.forEach((section) => {
    const items = sections.get(section)
    if (items?.length) {
      lines.push(`### ${section}`)
      items.forEach((item) => lines.push(`- ${item}`))
      lines.push('')
    }
  })

  if (lines[lines.length - 1] !== '') lines.push('')
  return lines.join('\n')
}

export function buildKeepAChangelog(contents) {
  return [
    '# Changelog',
    '',
    'All notable changes to this project will be documented in this file.',
    '',
    'The format is based on [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).',
    '',
    '## [Unreleased]',
    '',
    contents.trimEnd(),
    ''
  ]
    .filter((line, index, array) => !(line === '' && array[index - 1] === ''))
    .join('\n')
}

export function insertReleaseEntry(changelog, entry) {
  const marker = '## [Unreleased]\n\n'
  if (changelog.includes(marker)) {
    return changelog.replace(marker, `${marker}${entry}\n`)
  }

  return `${changelog.trimEnd()}\n\n## [Unreleased]\n\n${entry}\n`
}
