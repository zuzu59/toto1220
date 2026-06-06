import {
  GITHUB_API_RELEASES_LATEST_URL,
  GITHUB_API_TAGS_URL,
  GITHUB_CHANGES_URL,
  GITHUB_OWNER,
  GITHUB_PROFILE_URL,
  GITHUB_RELEASES_URL,
  GITHUB_REPO,
  GITHUB_REPO_URL
} from '../constants'

export const github = {
  owner: GITHUB_OWNER,
  repo: GITHUB_REPO,
  profileUrl: GITHUB_PROFILE_URL,
  repoUrl: GITHUB_REPO_URL,
  releasesUrl: GITHUB_RELEASES_URL,
  changelogUrl: GITHUB_CHANGES_URL,
  api: {
    latestReleaseUrl: GITHUB_API_RELEASES_LATEST_URL,
    tagsUrl: GITHUB_API_TAGS_URL
  }
}

export async function getLatestGithubReleaseVersion() {
  const endpoints = [github.api.latestReleaseUrl, github.api.tagsUrl]

  for (const endpoint of endpoints) {
    const url = new URL(endpoint)
    url.searchParams.set('_ts', String(Date.now()))
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) {
      continue
    }

    const data = await response.json()
    if (Array.isArray(data)) {
      return data[0]?.name?.replace(/^v/, '') || null
    }

    return data?.tag_name?.replace(/^v/, '') || null
  }

  return null
}
