import { createApp } from 'vue'
import 'vant/lib/index.css'
import './assets/style/index.less'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
