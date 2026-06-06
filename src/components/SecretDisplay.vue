<script setup>
import { computed, nextTick, ref } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  hasValue: Boolean,
  locked: Boolean
})

const emit = defineEmits(['request-unlock'])
const visible = ref(false)
const inputEl = ref(null)
const copied = ref(false)

const displayValue = computed(() => {
  if (!props.hasValue) {
    return ''
  }
  if (visible.value && !props.locked) {
    return props.value || ''
  }
  return '••••••••'
})

async function reveal() {
  if (props.locked) {
    emit('request-unlock')
    return
  }
  visible.value = true
  copied.value = false
  await nextTick()
  inputEl.value?.focus()
  inputEl.value?.select()
}

function hide() {
  visible.value = false
  copied.value = false
}

async function copyValue() {
  if (props.locked || !props.value) {
    emit('request-unlock')
    return
  }
  await navigator.clipboard.writeText(props.value)
  copied.value = true
  await nextTick()
  inputEl.value?.focus()
  inputEl.value?.select()
}
</script>

<template>
  <div v-if="hasValue" class="secret-field">
    <input
      ref="inputEl"
      class="secret-display"
      :class="{ revealed: visible && !locked }"
      :value="displayValue"
      readonly
      type="text"
      @click="reveal"
      @focus="reveal"
      @blur="hide"
      @keydown.esc="hide"
    />
    <button class="ghost-button secret-copy" type="button" @click="copyValue">
      {{ copied ? 'Copié' : 'Copier' }}
    </button>
  </div>
  <span v-else class="secret-display empty">—</span>
</template>
