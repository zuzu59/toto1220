<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { APP_VERSION, GITHUB_CHANGES_URL, GITHUB_PROFILE_URL, GITHUB_RELEASES_URL, GITHUB_REPO_URL } from '../constants'
import { getLatestGithubReleaseVersion } from '../services/github'
import { compareSemver } from '../services/version'
import { state } from '../state'

const route = useRoute()
const checking = ref(false)
const releaseStatus = ref('loading')
const releaseMessage = ref('')

const hasNewRelease = computed(() => state.latestRelease && compareSemver(state.latestRelease, APP_VERSION) > 0)

async function checkRelease() {
  checking.value = true
  releaseMessage.value = ''
  releaseStatus.value = 'loading'
  try {
    state.latestRelease = await getLatestGithubReleaseVersion()
    if (!state.latestRelease) {
      releaseStatus.value = 'unknown'
      releaseMessage.value = 'Impossible de vérifier les releases.'
      return
    }

    releaseStatus.value = hasNewRelease.value ? 'new' : 'up-to-date'
    releaseMessage.value = hasNewRelease.value ? `Nouvelle version disponible : ${state.latestRelease}` : 'Aucune nouvelle release.'
  } catch (error) {
    state.latestRelease = null
    releaseStatus.value = 'unknown'
    releaseMessage.value = error?.message || 'Impossible de vérifier les releases.'
  } finally {
    checking.value = false
  }
}

watch(
  () => route.fullPath,
  () => {
    checkRelease()
  },
  { immediate: true }
)
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
      <p v-else-if="releaseStatus === 'new'" class="warning-text">{{ releaseMessage }}</p>
      <a v-if="releaseStatus === 'new'" class="ghost-button" :href="GITHUB_RELEASES_URL" target="_blank" rel="noreferrer">
        Voir le changelog
      </a>
      <p v-else-if="releaseStatus === 'up-to-date'" class="muted">{{ releaseMessage }}</p>
      <p v-else class="muted">{{ releaseMessage || 'Impossible de vérifier les releases.' }}</p>
    </div>
  </section>
</template>
