<script setup>
// 路由视图组件
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- 根容器 -->
  <div id="app">
    <!-- 导航栏 -->
    <nav class="navigation-bar">
      <div class="nav-container">
        <!-- 网站名称 -->
        <div class="nav-name">
          <h2>GameHub</h2>
        </div>
        <!-- 导航菜单 -->
        <ul class="nav-menu">
          <li class="nav-item">
            <router-link to="/" class="nav-link">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/games" class="nav-link">All Games</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/news" class="nav-link">News and Info</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/videos" class="nav-link">Game Videos</router-link>
          </li>
        </ul>
      </div>
    </nav>
    
    <!-- 页面内容显示 -->
    <main class="main-content">
      <!-- 路由视图组件，自动根据当前路由渲染组件 -->
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* 导航栏样式 */
.navigation-bar {
  background-color: #eded50;
  color: #4D4D4D;
  padding: 1rem 0rem;
  position: sticky; /*导航栏始终可见*/
  top: 1rem;
  z-index: 100; /*层叠*/
  width: 100%;
}

.nav-container {
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4rem;
}

.nav-name h2 {
  margin: 0;
  color: #0074cc;
}

.nav-menu {
  display: flex;
  list-style: none;
}

.nav-item {
  margin-left: 2rem;
}

.nav-link {
  color: #5f5f4d;
  text-decoration: none;
  font-weight: 500;
}

/* 悬停样式 */
.nav-link:hover {
  color: #2163e8;
}

/* 点击 */
.nav-link.router-link-active {
  color: #2163e8;
  border-bottom: 2px solid #2163e8;
}

/* 页面内容区域 */
.main-content {
  width: 100%;
  min-height: calc(100vh - 120px);
}
</style>