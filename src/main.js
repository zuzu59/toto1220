import { createApp } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import router from './router'
import './styles.css'
import { loadApp, startAutoLockMonitor, touchActivity } from './state'

registerSW({ immediate: true })

window.addEventListener('pointerdown', touchActivity, { passive: true })
window.addEventListener('keydown', touchActivity)
window.addEventListener('scroll', touchActivity, { passive: true })

;(async () => {
  await loadApp()
  startAutoLockMonitor()
  createApp(App).use(router).mount('#app')
})()
