<script setup>
import { computed, ref } from 'vue'

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

const displayValue = computed(() => {
  if (!props.hasValue) {
    return '—'
  }
  if (visible.value && !props.locked) {
    return props.value || '—'
  }
  return '••••••••'
})

function pressStart() {
  if (props.locked) {
    emit('request-unlock')
    return
  }
  visible.value = true
}

function pressEnd() {
  visible.value = false
}
</script>

<template>
  <button
    class="secret-display"
    type="button"
    @click.prevent="pressStart"
    @mousedown="pressStart"
    @mouseup="pressEnd"
    @mouseleave="pressEnd"
    @touchstart.prevent="pressStart"
    @touchend="pressEnd"
    @touchcancel="pressEnd"
  >
    {{ displayValue }}
  </button>
</template>
