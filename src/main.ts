import { createApp } from 'vue'
import App from './App.vue'
import './amplify'
// Vuetify base styles first
import 'vuetify/styles'
// Then our overrides so they win the cascade
import './styles/typography.css'
import router from './router'
import { createVuetify } from 'vuetify'

import * as components from 'vuetify/components'
import { VDateInput } from 'vuetify/labs/VDateInput'
import * as directives from 'vuetify/directives'

import Vueform from '@vueform/vueform'
import vueformConfig from './../vueform.config'

import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { AgGridVue } from 'ag-grid-vue3'

import { VFileUpload } from 'vuetify/labs/VFileUpload'

ModuleRegistry.registerModules([AllCommunityModule])

const vuetify = createVuetify({
  components: { ...components, VDateInput, VFileUpload },
  directives,
})

const app = createApp(App)

// Casts prevent over-strict Plugin generic inference under some TS setups
app.use(router)
app.use(vuetify)
app.use(Vueform, vueformConfig)
app.component('AgGridVue', AgGridVue)
app.mount('#app')

// createApp(App).use(router).use(vuetify).mount('#app')
