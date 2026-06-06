<script setup>
import { onMounted, ref } from 'vue'
import { APP_VERSION, GITHUB_CHANGES_URL, GITHUB_PROFILE_URL, GITHUB_RELEASES_URL, GITHUB_REPO, GITHUB_REPO_URL, GITHUB_USER } from '../constants'
import { compareSemver } from '../services/version'
import { state } from '../state'

const checking = ref(false)

async function fetchLatestVersion() {
  const endpoints = [
    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`,
    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/tags?per_page=1`
  ]

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, { cache: 'no-store' })
    if (!response.ok) {
      if (response.status === 404) {
        continue
      }
      continue
    }

    const data = await response.json()
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.name?.replace(/^v/, '') || null
    }
    return data.tag_name?.replace(/^v/, '') || null
  }

  return null
}

async function checkRelease() {
  checking.value = true
  state.latestReleaseError = ''
  try {
    state.latestRelease = await fetchLatestVersion()
  } catch (error) {
    state.latestReleaseError = ''
    state.latestRelease = null
  } finally {
    checking.value = false
  }
}

onMounted(checkRelease)
</script>

<template>
  <section class="page">
    <div class="page-head">
      <h1>About</h1>
      <p>Informations projet et vérification GitHub</p>
    </div>

    <div class="record-card stacked">
      <a :href="GITHUB_PROFILE_URL" target="_blank" rel="noreferrer">GitHub.com/zuzu59</a>
      <a :href="GITHUB_REPO_URL" target="_blank" rel="noreferrer">Dépôt de l’application</a>
      <a class="ghost-button" :href="GITHUB_CHANGES_URL" target="_blank" rel="noreferrer">
        Version {{ APP_VERSION }}
      </a>
      <p v-if="checking">Vérification des releases...</p>
      <p v-else-if="state.latestRelease && compareSemver(state.latestRelease, APP_VERSION) > 0" class="warning-text">
        Nouvelle version disponible : {{ state.latestRelease }}
        <a :href="GITHUB_RELEASES_URL" target="_blank" rel="noreferrer">Voir le changelog</a>
      </p>
      <p v-else-if="state.latestRelease">Vous êtes à jour.</p>
      <p v-else class="muted">Aucune release détectée pour le moment.</p>
    </div>
  </section>
</template>
