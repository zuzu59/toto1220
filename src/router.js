import { createRouter, createWebHashHistory } from 'vue-router'
import RecordsPage from './pages/RecordsPage.vue'
import RecordEditorPage from './pages/RecordEditorPage.vue'
import TagsPage from './pages/TagsPage.vue'
import ToolsPage from './pages/ToolsPage.vue'
import AboutPage from './pages/AboutPage.vue'
import HelpPage from './pages/HelpPage.vue'

const routes = [
  { path: '/', name: 'records', component: RecordsPage },
  { path: '/records/new', name: 'record-new', component: RecordEditorPage, props: { recordId: null } },
  { path: '/records/:id', name: 'record-view', component: RecordEditorPage, props: true },
  { path: '/tags', name: 'tags', component: TagsPage },
  { path: '/tools', name: 'tools', component: ToolsPage },
  { path: '/about', name: 'about', component: AboutPage },
  { path: '/help', name: 'help', component: HelpPage }
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})
