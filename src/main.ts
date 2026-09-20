import { createApp } from 'vue'
import { Locale, Popup, PullRefresh } from 'vant'
import zhCN from 'vant/es/locale/lang/zh-CN'
import 'vant/lib/index.css'
import './assets/style/index.less'
import App from './App.vue'
import router from './router'

Locale.use('zh-CN', zhCN)

createApp(App).use(router).use(Popup).use(PullRefresh).mount('#app')
