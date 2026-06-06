<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  tags: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])
const open = ref(false)

const selected = computed(() => props.modelValue || [])
const available = computed(() => props.tags.filter((tag) => !selected.value.includes(tag.id)))

function addTag(tagId) {
  emit('update:modelValue', [...selected.value, tagId])
  open.value = false
}

function removeTag(tagId) {
  emit('update:modelValue', selected.value.filter((id) => id !== tagId))
}
</script>

<template>
  <div class="tag-picker">
    <div class="chip-row">
      <span v-for="tagId in selected" :key="tagId" class="chip">
        {{ props.tags.find((tag) => tag.id === tagId)?.name || 'Tag' }}
        <button type="button" class="chip-remove" @click="removeTag(tagId)">×</button>
      </span>
      <button type="button" class="chip-add" @click="open = !open">+</button>
    </div>
    <div v-if="open" class="dropdown-list">
      <button v-for="tag in available" :key="tag.id" type="button" class="dropdown-item" @click="addTag(tag.id)">
        {{ tag.name }}
      </button>
      <p v-if="!available.length" class="muted">Aucun tag disponible.</p>
    </div>
  </div>
</template>
