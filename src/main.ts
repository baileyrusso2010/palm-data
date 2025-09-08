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

const vuetify = createVuetify({
  components: { ...components, VDateInput },
  directives,
})

createApp(App).use(router).use(vuetify).mount('#app')
