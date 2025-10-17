<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// 导入搜索框组件
import SearchBar from '../components/SearchBar.vue'
// 导入游戏卡片组件
import GameCard from '../components/GameCard.vue'
import { getPopularGames } from '../api'

// 获取路由实例
const router = useRouter()

// 响应式数据
const hotGames = ref([]) // 热门游戏列表
const loading = ref(false) // 加载状态

// 获取热门游戏
const fetchHotGames = async () => {
  try {
    loading.value = true
    // 调用 API 获取热门游戏，增加数量到20个
    const response = await getPopularGames(20)
    // 确保响应是数组
    hotGames.value = Array.isArray(response) ? response : []
    console.log('获取到的热门游戏:', hotGames.value)
  } catch (error) {
    console.error('获取热门游戏失败:', error)
    // 发生错误时设置为空数组
    hotGames.value = []
  } finally {
    loading.value = false
  }
}

// 处理搜索事件
const handleSearch = (query) => {
  // 跳转到游戏列表页并传递搜索关键词
  router.push({ name: 'Games', query: { search: query } })
}

// 组件挂载时获取热门游戏
onMounted(() => {
  fetchHotGames()
})
</script>

<template>
  <div class="home">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>欢迎来到 GameHub</h1>
      <p>发现最新最热的游戏资讯和评价</p>
    </div>
    
    <!-- 搜索框 -->
    <div class="search-section">
      <SearchBar @search="handleSearch" placeholder="搜索游戏..." />
    </div>
    
    <!-- 推荐内容 -->
    <div class="recommendation-section">
      <div class="section-header">
        <h2>热门游戏推荐</h2>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <p>正在加载热门游戏...</p>
      </div>
      
      <!-- 无数据状态 -->
      <div v-else-if="hotGames.length === 0" class="no-data">
        <p>暂无热门游戏数据</p>
      </div>
      
      <!-- 游戏列表 -->
      <div v-else class="games-grid">
        <GameCard 
          v-for="game in hotGames" 
          :key="game.id" 
          :game="game"
          @click="() => $router.push({ name: 'GameDetail', params: { id: game.id } })"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 2rem 2rem;
  /* 添加背景图片 */
  background-image: url('../assets/home-background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  box-sizing: border-box;
  min-height: calc(100vh - 100px); /* 确保背景覆盖整个可视区域 */
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* 添加文字阴影以提高可读性 */
}

.page-header p {
  font-size: 1.2rem;
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* 添加文字阴影以提高可读性 */
}

.search-section {
  max-width: 600px;
  margin: 0 auto 3rem;
}

.recommendation-section {
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.8); /* 半透明背景 */
  padding: 2rem;
  border-radius: 10px;
  backdrop-filter: blur(5px); /* 毛玻璃效果 */
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  padding-left: 1rem;
  border-left: 4px solid #3498db;
}

.loading, .no-data {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home {
    padding: 1rem 0;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .recommendation-section {
    padding: 1rem;
  }
  
  .games-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
}
</style>