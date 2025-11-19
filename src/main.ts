import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 引入 Tailwind CSS
import './assets/tailwind.css'

// 引入移动端适配
import './utils/flexible'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
