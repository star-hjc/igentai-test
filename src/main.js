import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import directives from './directives'
import myCustomComponents from './components'
import './style/index.css'

const app = createApp(App)
/** 组件注册 */
myCustomComponents.install(app)

/** 路由 - VueRouter */
app.use(router)
/** 自定义指令 */
app.use(directives)
/** 状态管理器 - Pinia */
app.use(store)

app.mount('#app')
