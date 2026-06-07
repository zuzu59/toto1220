import { buildGithubReleaseNotes, getCommits, getPreviousTag, getTagDate, getVersionTags } from './changelog-utils.mjs'

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
const repository = process.env.GITHUB_REPOSITORY

if (!token) {
  throw new Error('GITHUB_TOKEN manquant')
}

if (!repository) {
  throw new Error('GITHUB_REPOSITORY manquant')
}

const [owner, repo] = repository.split('/')
if (!owner || !repo) {
  throw new Error(`GITHUB_REPOSITORY invalide: ${repository}`)
}

const versions = getVersionTags().filter((tag) => /^v\d+\.\d+\.\d+$/.test(tag))
const apiBase = `https://api.github.com/repos/${owner}/${repo}`

async function githubRequest(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GitHub API ${response.status} ${response.statusText}: ${text}`)
  }

  return response.status === 204 ? null : response.json()
}

const releases = await githubRequest('/releases?per_page=100')
const releaseByTag = new Map(releases.map((release) => [release.tag_name, release]))

for (const tag of versions) {
  const release = releaseByTag.get(tag)
  if (!release) continue

  const previousTag = getPreviousTag(tag, versions)
  const range = previousTag ? `${previousTag}..${tag}` : `${tag}`
  const commits = getCommits(range)
  const version = tag.replace(/^v/, '')
  const date = getTagDate(tag)
  const body = buildGithubReleaseNotes(version, date, commits.length ? commits : [{ subject: 'Mise à jour de maintenance.', body: '' }])

  if (release.body === body) continue

  await githubRequest(`/releases/${release.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body })
  })
}

console.log(`Releases synchronisées: ${versions.length}`)
