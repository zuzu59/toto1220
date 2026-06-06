<script setup>
import { reactive, ref } from 'vue'
import { deleteTag, saveTag, state } from '../state'

const form = reactive({ id: null, name: '', color: '#38bdf8' })
const editing = ref(false)

function startEdit(tag) {
  Object.assign(form, tag)
  editing.value = true
}

function resetForm() {
  Object.assign(form, { id: null, name: '', color: '#38bdf8' })
  editing.value = false
}

async function submit() {
  await saveTag(form)
  resetForm()
}

async function remove(tag) {
  if (window.confirm(`Supprimer le tag « ${tag.name} » ?`)) {
    await deleteTag(tag.id)
    if (form.id === tag.id) resetForm()
  }
}
</script>

<template>
  <section class="page">
    <div class="page-head">
      <h1>Tags</h1>
      <p>Gestion des tags de classification</p>
    </div>

    <div class="record-card">
      <form class="edit-grid" @submit.prevent="submit">
        <label>Nom <input v-model="form.name" class="text-input" required /></label>
        <label>Couleur <input v-model="form.color" class="text-input" type="color" /></label>
        <div class="inline-actions full-width">
          <button v-if="editing" class="ghost-button" type="button" @click="resetForm">Annuler</button>
          <button class="primary-button" type="submit">{{ editing ? 'Mettre à jour' : 'Ajouter' }}</button>
        </div>
      </form>
    </div>

    <div class="cards-list">
      <article v-for="tag in state.tags" :key="tag.id" class="mini-card">
        <span class="chip" :style="{ backgroundColor: tag.color }">{{ tag.name }}</span>
        <div class="inline-actions">
          <button class="ghost-button" type="button" @click="startEdit(tag)">Modifier</button>
          <button class="danger-button" type="button" @click="remove(tag)">Supprimer</button>
        </div>
      </article>
      <p v-if="!state.tags.length" class="empty-state">Aucun tag.</p>
    </div>
  </section>
</template>
