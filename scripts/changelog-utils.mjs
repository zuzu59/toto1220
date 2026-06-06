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
    return execFileSync('git', ['log', '-1', '--format=%ci', tag], { encoding: 'utf8' }).trim().slice(0, 16).replace('T', ' ')
  } catch {
    return new Date().toISOString().slice(0, 16).replace('T', ' ')
  }
}

export function getPreviousTag(tag, tags = getVersionTags()) {
  const index = tags.indexOf(tag)
  return index > 0 ? tags[index - 1] : ''
}

export function getCommits(range) {
  if (!range) {
    return []
  }

  const output = execFileSync('git', ['log', '--reverse', '--no-merges', '--format=%H%x1f%s%x1f%b%x1e', range], { encoding: 'utf8' }).trim()
  if (!output) return []

  return output
    .split('\x1e')
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash = '', subject = '', body = ''] = record.split('\x1f')
      return { hash: hash.trim(), subject: subject.trim(), body: body.trimEnd() }
    })
}

export function getCommitSubjects(range) {
  return getCommits(range).map((commit) => commit.subject)
}

export function classifySubject(subject) {
  const match = String(subject || '').match(/^(new|change|fixe|refact|doc|del)(\([^)]+\))?:\s*(.+)$/i)
  if (match) {
    const section = PREFIX_TO_SECTION.get(match[1].toLowerCase()) || 'Changed'
    return { section, text: `${match[1].toLowerCase()}${match[2] || ''}: ${match[3]}` }
  }

  return { section: 'Changed', text: String(subject || '').trim() }
}

function formatCommitBody(body, indent = '  - ') {
  const lines = String(body || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) return []
  return lines.map((line) => `${indent}${line.replace(/^[*-]\s*/, '')}`)
}

export function buildReleaseEntry(version, date, commits) {
  const sections = new Map()

  for (const commit of commits) {
    const subject = typeof commit === 'string' ? commit : commit?.subject
    if (!subject || /^change:\s*bump version/i.test(subject)) continue
    const { section, text } = classifySubject(subject)
    const item = { text, body: typeof commit === 'string' ? [] : formatCommitBody(commit.body) }
    if (!sections.has(section)) sections.set(section, [])
    sections.get(section).push(item)
  }

  const order = ['Added', 'Changed', 'Fixed', 'Removed']
  const lines = [`## [${version}] - ${date}`]
  order.forEach((section) => {
    const items = sections.get(section)
    if (items?.length) {
      lines.push(`### ${section}`)
      items.forEach((item) => {
        lines.push(`- ${item.text}`)
        lines.push(...item.body)
      })
      lines.push('')
    }
  })

  if (lines[lines.length - 1] !== '') lines.push('')
  return lines.join('\n')
}

export function buildGithubReleaseNotes(version, date, commits) {
  const lines = [`# Release v${version}`, '', `Date: ${date}`, '']
  const filtered = commits.filter((commit) => {
    const subject = typeof commit === 'string' ? commit : commit?.subject
    return subject && !/^change:\s*bump version/i.test(subject)
  })

  if (!filtered.length) {
    lines.push('- Mise à jour de maintenance.')
    return lines.join('\n')
  }

  for (const commit of filtered) {
    const subject = commit.subject || String(commit)
    const shortHash = String(commit.hash || '').slice(0, 7)
    lines.push(`## ${shortHash} — ${subject}`)
    const bodyLines = formatCommitBody(commit.body, '- ')
    if (bodyLines.length) {
      lines.push(...bodyLines)
    }
    lines.push('')
  }

  return lines.join('\n').trimEnd()
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
