<script setup>
const props = defineProps({
  open: Boolean,
  error: String,
  passphrase: String
})

const emit = defineEmits(['update:passphrase', 'submit', 'close'])
</script>

<template>
  <div v-if="open" class="modal-backdrop">
    <div class="modal-card">
      <h2>Déverrouiller l’application</h2>
      <p>Le mot de passe maître dérive la clé AES. La session se verrouille après inactivité.</p>
      <input
        class="text-input"
        :value="passphrase"
        type="password"
        placeholder="Code de déchiffrement"
        @input="emit('update:passphrase', $event.target.value)"
        @keyup.enter="emit('submit')"
      />
      <p v-if="error" class="error-text">{{ error }}</p>
      <div class="modal-actions">
        <button class="ghost-button" type="button" @click="emit('close')">Annuler</button>
        <button class="primary-button" type="button" @click="emit('submit')">Valider</button>
      </div>
    </div>
  </div>
</template>
