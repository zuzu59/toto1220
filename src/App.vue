<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { APP_VERSION, GITHUB_CHANGES_URL } from './constants'
import { lockApp, state, touchActivity, unlockApp } from './state'
import UnlockDialog from './components/UnlockDialog.vue'

const route = useRoute()
const router = useRouter()
const showUnlock = ref(false)
const passphrase = ref('')
const error = ref('')

const isRecordsPage = computed(() => route.name === 'records')

async function submitUnlock() {
  error.value = ''
  try {
    await unlockApp(passphrase.value)
    passphrase.value = ''
    showUnlock.value = false
  } catch (err) {
    error.value = err?.message || 'Déverrouillage impossible'
  }
}

function openUnlock() {
  passphrase.value = ''
  error.value = ''
  showUnlock.value = true
}

function handleMenu() {
  state.drawerOpen = !state.drawerOpen
}

function closeDrawer() {
  state.drawerOpen = false
}

function goHome() {
  router.push('/')
}

function onUnlockRequest() {
  showUnlock.value = true
}

function handleLock() {
  lockApp()
}

onMounted(() => {
  window.addEventListener('zservices-unlock-request', onUnlockRequest)
})

onBeforeUnmount(() => {
  window.removeEventListener('zservices-unlock-request', onUnlockRequest)
})

watch(
  () => route.fullPath,
  () => {
    closeDrawer()
  }
)
</script>

<template>
  <div class="app-shell" @pointerdown="touchActivity">
    <header class="topbar">
      <button class="icon-button" type="button" @click="handleMenu" aria-label="Menu">☰</button>
      <button class="brand" type="button" @click="goHome">Z-Services</button>
      <input
        v-if="isRecordsPage"
        v-model="state.query"
        class="search-input"
        type="search"
        placeholder="Rechercher dans tous les champs"
        aria-label="Recherche"
      />
      <div class="actions">
        <button v-if="state.unlocked" class="ghost-button" type="button" @click="handleLock">Verrouiller</button>
        <button v-else class="primary-button" type="button" @click="openUnlock">Déverrouiller</button>
        <RouterLink v-if="isRecordsPage" class="primary-button" to="/records/new">+ Nouveau</RouterLink>
      </div>
    </header>

    <div v-if="state.drawerOpen" class="drawer-overlay" @click="closeDrawer"></div>
    <aside class="drawer" :class="{ open: state.drawerOpen }" @click.stop>
      <RouterLink to="/" class="drawer-link">Records</RouterLink>
      <RouterLink to="/tags" class="drawer-link">Tags</RouterLink>
      <RouterLink to="/tools" class="drawer-link">Import / Export</RouterLink>
      <RouterLink to="/help" class="drawer-link">Help</RouterLink>
      <RouterLink to="/about" class="drawer-link">About</RouterLink>
    </aside>

    <main class="main-content">
      <div v-if="state.notice" class="notice">{{ state.notice }}</div>
      <RouterView />
    </main>

    <footer class="footer">
      <span>Version: <a :href="GITHUB_CHANGES_URL" target="_blank" rel="noreferrer">{{ APP_VERSION }}</a></span>
    </footer>

    <UnlockDialog
      :open="showUnlock"
      :error="error"
      v-model:passphrase="passphrase"
      @close="showUnlock = false"
      @submit="submitUnlock"
    />
  </div>
</template>
