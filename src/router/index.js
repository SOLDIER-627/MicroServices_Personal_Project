// 导入 Vue Router 所需模块
import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
import Home from '../views/Home.vue'
import News from '../views/News.vue'
import Games from '../views/Games.vue'
import GameDetail from '../views/GameDetail.vue'
import Videos from '../views/Videos.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/news',
    name: 'News',
    component: News
  },
  {
    path: '/games',
    name: 'Games',
    component: Games
  },
  {
    path: '/game/:id',
    name: 'GameDetail',
    component: GameDetail,
    props: true // 把参数以props的形式传递给组件
  },
  {
    path: '/videos',
    name: 'Videos',
    component: Videos
  }
]

// 创建路由器实例
const router = createRouter({
  history: createWebHistory(), // 历史模式
  routes
})

// 导出路由器实例
export default router