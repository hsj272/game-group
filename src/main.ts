import { createApp } from 'vue'
import { Popup, PullRefresh } from 'vant'
import 'vant/lib/index.css'
import './assets/style/index.less'
import App from './App.vue'
import router from './router'

createApp(App).use(router).use(Popup).use(PullRefresh).mount('#app')
