<script setup>
import { ref } from 'vue'
import { exportConfigJson, exportDatabaseCsv, importConfigJson, importDatabaseCsv } from '../services/backup'
import { loadApp, resetAndImportDatabase, state } from '../state'

const csvInput = ref(null)
const configInput = ref(null)
const busy = ref(false)
const message = ref('')

function download(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function handleExportCsv() {
  busy.value = true
  message.value = ''
  try {
    const csv = await exportDatabaseCsv()
    download(`z-services-backup-${Date.now()}.csv`, csv, 'text/csv')
    message.value = 'Export CSV généré.'
  } finally {
    busy.value = false
  }
}

async function handleExportConfig() {
  busy.value = true
  message.value = ''
  try {
    download(`z-services-config-${Date.now()}.json`, exportConfigJson(state.settings), 'application/json')
    message.value = 'Configuration exportée.'
  } finally {
    busy.value = false
  }
}

async function handleCsvFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const csv = await file.text()
  if (!window.confirm('Cette importation va remettre la base à zéro. Continuer ?')) {
    message.value = 'Import CSV annulé.'
    return
  }
  busy.value = true
  try {
    await resetAndImportDatabase(() => importDatabaseCsv(csv))
    message.value = 'Base importée avec succès.'
  } catch (error) {
    message.value = error?.message || 'Erreur d’import CSV.'
  } finally {
    busy.value = false
    event.target.value = ''
  }
}

async function handleConfigFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const json = await file.text()
  busy.value = true
  try {
    await importConfigJson(json)
    await loadApp()
    message.value = 'Configuration importée.'
  } catch (error) {
    message.value = error?.message || 'Erreur d’import JSON.'
  } finally {
    busy.value = false
    event.target.value = ''
  }
}
</script>

<template>
  <section class="page">
    <div class="page-head">
      <h1>Import / Export</h1>
      <p>CSV pour la base complète, JSON pour la configuration</p>
    </div>

    <div class="record-card stacked">
      <button class="primary-button" :disabled="busy" type="button" @click="handleExportCsv">Exporter toute la base en CSV</button>
      <label class="file-button">
        Importer un CSV complet
        <input ref="csvInput" type="file" accept=".csv,text/csv" hidden @change="handleCsvFile" />
      </label>
      <button class="ghost-button" :disabled="busy" type="button" @click="handleExportConfig">Exporter la config en JSON</button>
      <label class="file-button">
        Importer la config JSON
        <input ref="configInput" type="file" accept=".json,application/json" hidden @change="handleConfigFile" />
      </label>
      <p v-if="message" class="notice">{{ message }}</p>
    </div>
  </section>
</template>
