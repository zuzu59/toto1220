<script setup>
import { onMounted, ref } from 'vue'
import { APP_VERSION, GITHUB_CHANGES_URL, GITHUB_PROFILE_URL, GITHUB_RELEASES_URL, GITHUB_REPO_URL } from '../constants'
import { compareSemver } from '../services/version'
import { state } from '../state'

const checking = ref(false)

async function checkRelease() {
  checking.value = true
  state.latestReleaseError = ''
  try {
    const response = await fetch('https://api.github.com/repos/zuzu59/z-services/releases/latest')
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
      <button class="ghost-button" type="button" @click="window.open(GITHUB_CHANGES_URL, '_blank')">
        Version {{ APP_VERSION }}
      </button>
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
