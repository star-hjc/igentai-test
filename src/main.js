import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import directives from './directives'
import initComponents from './components'
import './style/index.css'
/** font字体 */
import './style/font.css'
/** element 消息组件样式 */
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

const app = createApp(App)
/** 组件注册 */
initComponents.install(app)

/** 路由 - VueRouter */
app.use(router)
/** 自定义指令 */
app.use(directives)
/** 状态管理器 - Pinia */

app.mount('#app')
