<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TagPicker from '../components/TagPicker.vue'
import SecretDisplay from '../components/SecretDisplay.vue'
import { db } from '../services/db'
import {
  deleteRecord,
  getRecordTags,
  getSecretPayloads,
  prepareRecordForForm,
  saveRecord,
  state
} from '../state'

const route = useRoute()
const router = useRouter()
const isEditing = ref(route.name === 'record-new')
const loading = ref(true)
const copiedKey = ref('')
const secretPayloads = reactive({
  ssh1Password: null,
  ssh2Password: null,
  html1Password: null,
  html2Password: null
})

const form = reactive({
  id: null,
  serviceName: '',
  ip: '',
  url: '',
  description: '',
  tagIds: [],
  ssh1String: '',
  ssh1Password: '',
  ssh2String: '',
  ssh2Password: '',
  html1String: '',
  html1Password: '',
  html2String: '',
  html2Password: '',
  note: '',
  createdAt: null,
  modifiedAt: null
})

const title = computed(() => (route.name === 'record-new' ? 'Nouveau record' : form.serviceName || 'Record'))
const hasSecrets = computed(() => Boolean(secretPayloads.ssh1Password || secretPayloads.ssh2Password || secretPayloads.html1Password || secretPayloads.html2Password))

async function loadRecord() {
  loading.value = true
  const recordId = route.params.id
  if (route.name === 'record-new') {
    Object.assign(form, {
      id: null,
      serviceName: '',
      ip: '',
      url: '',
      description: '',
      tagIds: [],
      ssh1String: '',
      ssh1Password: '',
      ssh2String: '',
      ssh2Password: '',
      html1String: '',
      html1Password: '',
      html2String: '',
      html2Password: '',
      note: '',
      createdAt: null,
      modifiedAt: null
    })
    Object.assign(secretPayloads, {
      ssh1Password: null,
      ssh2Password: null,
      html1Password: null,
      html2Password: null
    })
    isEditing.value = true
    loading.value = false
    return
  }

  const existing = state.records.find((item) => String(item.id) === String(recordId)) || (await db.records.get(Number(recordId)))
  if (!existing) {
    await router.replace('/')
    return
  }

  const prepared = await prepareRecordForForm(existing)
  Object.assign(form, prepared, {
    ssh1Password: state.unlocked ? prepared.ssh1Password : '',
    ssh2Password: state.unlocked ? prepared.ssh2Password : '',
    html1Password: state.unlocked ? prepared.html1Password : '',
    html2Password: state.unlocked ? prepared.html2Password : ''
  })
  Object.assign(secretPayloads, getSecretPayloads(existing))
  isEditing.value = false
  loading.value = false
}

async function save() {
  const saved = await saveRecord(form, secretPayloads)
  await router.replace(`/records/${saved.id}`)
  isEditing.value = false
  await loadRecord()
}

async function remove() {
  if (!form.id) return
  if (window.confirm('Supprimer ce record ?')) {
    await deleteRecord(form.id)
    await router.push('/')
  }
}

function edit() {
  isEditing.value = true
}

function cancel() {
  if (route.name === 'record-new') {
    router.push('/')
    return
  }
  isEditing.value = false
  loadRecord()
}

function tagNames(record) {
  return getRecordTags(record).map((tag) => tag.name).join(', ')
}

function requestUnlock() {
  window.dispatchEvent(new CustomEvent('zservices-unlock-request'))
}

async function copyText(key, value) {
  if (!value) return
  await navigator.clipboard.writeText(value)
  copiedKey.value = key
  window.setTimeout(() => {
    if (copiedKey.value === key) copiedKey.value = ''
  }, 1500)
}

watch(
  () => route.params.id,
  async () => {
    await loadRecord()
  }
)

watch(
  () => state.unlocked,
  async () => {
    if (!isEditing.value) {
      await loadRecord()
    }
  }
)

onMounted(loadRecord)
</script>

<template>
  <section class="page record-page">
    <div class="page-head">
      <div>
        <h1>{{ title }}</h1>
        <p v-if="!isEditing">Tags: {{ tagNames(form) || '—' }}</p>
      </div>
      <div class="inline-actions">
        <button v-if="!isEditing" class="ghost-button" type="button" @click="edit">Modifier</button>
        <button v-if="!isEditing" class="danger-button" type="button" @click="remove">Supprimer</button>
        <button v-if="isEditing" class="ghost-button" type="button" @click="cancel">Annuler</button>
        <button v-if="isEditing" class="primary-button" type="button" @click="save">Enregistrer</button>
      </div>
    </div>

    <div v-if="loading" class="empty-state">Chargement...</div>

    <div v-else class="record-card">
      <div v-if="!isEditing" class="read-grid">
        <div><span class="field-label">Nom du service</span><div>{{ form.serviceName || '—' }}</div></div>
        <div><span class="field-label">IP</span><div>{{ form.ip || '—' }}</div></div>
        <div><span class="field-label">URL</span><div>{{ form.url || '—' }}</div></div>
        <div><span class="field-label">Description</span><div>{{ form.description || '—' }}</div></div>
        <div><span class="field-label">Tags</span><div>{{ tagNames(form) || '—' }}</div></div>
        <div>
          <span class="field-label">SSH1</span>
          <div class="copy-field">
            <div class="copy-value">{{ form.ssh1String || '—' }}</div>
            <button class="ghost-button secret-copy" type="button" :disabled="!form.ssh1String" @click="copyText('ssh1', form.ssh1String)">{{ copiedKey === 'ssh1' ? 'Copié' : 'Copier' }}</button>
          </div>
        </div>
        <div><span class="field-label">SSH1 password</span><SecretDisplay :value="form.ssh1Password" :has-value="Boolean(secretPayloads.ssh1Password)" :locked="!state.unlocked" @request-unlock="requestUnlock" /></div>
        <div>
          <span class="field-label">SSH2</span>
          <div class="copy-field">
            <div class="copy-value">{{ form.ssh2String || '—' }}</div>
            <button class="ghost-button secret-copy" type="button" :disabled="!form.ssh2String" @click="copyText('ssh2', form.ssh2String)">{{ copiedKey === 'ssh2' ? 'Copié' : 'Copier' }}</button>
          </div>
        </div>
        <div><span class="field-label">SSH2 password</span><SecretDisplay :value="form.ssh2Password" :has-value="Boolean(secretPayloads.ssh2Password)" :locked="!state.unlocked" @request-unlock="requestUnlock" /></div>
        <div>
          <span class="field-label">HTML1</span>
          <div class="copy-field">
            <div class="copy-value">{{ form.html1String || '—' }}</div>
            <button class="ghost-button secret-copy" type="button" :disabled="!form.html1String" @click="copyText('html1', form.html1String)">{{ copiedKey === 'html1' ? 'Copié' : 'Copier' }}</button>
          </div>
        </div>
        <div><span class="field-label">HTML1 password</span><SecretDisplay :value="form.html1Password" :has-value="Boolean(secretPayloads.html1Password)" :locked="!state.unlocked" @request-unlock="requestUnlock" /></div>
        <div>
          <span class="field-label">HTML2</span>
          <div class="copy-field">
            <div class="copy-value">{{ form.html2String || '—' }}</div>
            <button class="ghost-button secret-copy" type="button" :disabled="!form.html2String" @click="copyText('html2', form.html2String)">{{ copiedKey === 'html2' ? 'Copié' : 'Copier' }}</button>
          </div>
        </div>
        <div><span class="field-label">HTML2 password</span><SecretDisplay :value="form.html2Password" :has-value="Boolean(secretPayloads.html2Password)" :locked="!state.unlocked" @request-unlock="requestUnlock" /></div>
        <div class="full-width"><span class="field-label">Note</span><div>{{ form.note || '—' }}</div></div>
        <div><span class="field-label">Créé</span><div>{{ form.createdAt ? new Date(form.createdAt).toLocaleString('fr-FR') : '—' }}</div></div>
        <div><span class="field-label">Modifié</span><div>{{ form.modifiedAt ? new Date(form.modifiedAt).toLocaleString('fr-FR') : '—' }}</div></div>
      </div>

      <form v-else class="edit-grid" @submit.prevent="save">
        <label>Nom du service <input v-model="form.serviceName" class="text-input" required /></label>
        <label>IP <input v-model="form.ip" class="text-input" /></label>
        <label>URL <input v-model="form.url" class="text-input" /></label>
        <label>Description <textarea v-model="form.description" class="text-input text-area" rows="3" /></label>
        <label class="full-width">Tags <TagPicker v-model="form.tagIds" :tags="state.tags" /></label>
        <label>SSH1 string <input v-model="form.ssh1String" class="text-input" /></label>
        <label>SSH1 password <input v-model="form.ssh1Password" class="text-input" :placeholder="state.unlocked ? 'Mot de passe' : 'Déverrouillez pour modifier'" :disabled="!state.unlocked" /></label>
        <label>SSH2 string <input v-model="form.ssh2String" class="text-input" /></label>
        <label>SSH2 password <input v-model="form.ssh2Password" class="text-input" :placeholder="state.unlocked ? 'Mot de passe' : 'Déverrouillez pour modifier'" :disabled="!state.unlocked" /></label>
        <label>HTML1 string <input v-model="form.html1String" class="text-input" /></label>
        <label>HTML1 password <input v-model="form.html1Password" class="text-input" :placeholder="state.unlocked ? 'Mot de passe' : 'Déverrouillez pour modifier'" :disabled="!state.unlocked" /></label>
        <label>HTML2 string <input v-model="form.html2String" class="text-input" /></label>
        <label>HTML2 password <input v-model="form.html2Password" class="text-input" :placeholder="state.unlocked ? 'Mot de passe' : 'Déverrouillez pour modifier'" :disabled="!state.unlocked" /></label>
        <label class="full-width">Note <textarea v-model="form.note" class="text-input text-area" rows="4" /></label>
      </form>

      <p v-if="!state.unlocked && isEditing && hasSecrets" class="warning-text">
        L’application est verrouillée : les mots de passe existants seront conservés, mais vous ne pouvez pas les lire ni les modifier.
      </p>
    </div>
  </section>
</template>
