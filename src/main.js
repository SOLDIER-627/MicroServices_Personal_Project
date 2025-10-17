import { createApp } from 'vue'
import './style.css'
// 导入应用根组件
import App from './App.vue'
// 导入路由配置
import router from './router'

const app = createApp(App)

// 路由
app.use(router)

// 挂载
app.mount('#app')