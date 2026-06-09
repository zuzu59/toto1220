<script setup>
import { computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { formatDate, getRecordTags, searchRecords, sortRecords, state } from '../state'

const filtered = computed(() => searchRecords(sortRecords(state.records, state.sortBy, state.sortDir), state.query, state.tags))
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / state.pageSize)))
const currentPage = computed(() => Math.min(state.page, totalPages.value))
const pageRecords = computed(() => {
  const start = (currentPage.value - 1) * state.pageSize
  return filtered.value.slice(start, start + state.pageSize)
})

function toggleSort(column) {
  if (state.sortBy === column) {
    state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc'
    return
  }
  state.sortBy = column
  state.sortDir = 'asc'
}

function gotoPage(nextPage) {
  state.page = Math.min(Math.max(nextPage, 1), totalPages.value)
}

function recordSummary(record) {
  return [record.serviceName, record.ip, record.url, record.description].filter(Boolean).join(' · ')
}

watch(
  () => state.query,
  () => {
    state.page = 1
  }
)
</script>

<template>
  <section class="page records-page">
    <div class="page-head">
      <h1>Records</h1>
      <p>{{ filtered.length }} résultat(s)</p>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th><button type="button" @click="toggleSort('serviceName')">Service</button></th>
            <th><button type="button" @click="toggleSort('ip')">IP</button></th>
            <th><button type="button" @click="toggleSort('url')">URL</button></th>
            <th><button type="button" @click="toggleSort('modifiedAt')">Modifié</button></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in pageRecords" :key="record.id">
            <td>
              <RouterLink :to="`/records/${record.id}`" class="record-link">{{ record.serviceName }}</RouterLink>
              <div class="muted">{{ recordSummary(record) }}</div>
            </td>
            <td>{{ record.ip }}</td>
            <td>{{ record.url }}</td>
            <td>{{ formatDate(record.modifiedAt) }}</td>
          </tr>
          <tr v-if="!pageRecords.length">
            <td colspan="4" class="empty-state">Aucun record trouvé.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button class="ghost-button" type="button" @click="gotoPage(currentPage - 1)" :disabled="currentPage === 1">Préc.</button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button class="ghost-button" type="button" @click="gotoPage(currentPage + 1)" :disabled="currentPage === totalPages">Suiv.</button>
    </div>
  </section>
</template>
