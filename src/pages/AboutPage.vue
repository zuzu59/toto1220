<script setup>
import { onMounted, ref } from 'vue'
import { APP_VERSION, GITHUB_CHANGES_URL, GITHUB_PROFILE_URL, GITHUB_RELEASES_URL, GITHUB_REPO, GITHUB_REPO_URL, GITHUB_USER } from '../constants'
import { compareSemver } from '../services/version'
import { state } from '../state'

const checking = ref(false)

async function checkRelease() {
  checking.value = true
  state.latestReleaseError = ''
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`)
    if (!response.ok) throw new Error('GitHub indisponible')
    const data = await response.json()
    state.latestRelease = data.tag_name?.replace(/^v/, '') || null
  } catch (error) {
    state.latestReleaseError = error?.message || 'Impossible de vérifier les releases'
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
      <p v-if="state.latestReleaseError" class="muted">{{ state.latestReleaseError }}</p>
    </div>
  </section>
</template>
