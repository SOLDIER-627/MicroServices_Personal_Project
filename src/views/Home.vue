<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// 搜索框组件
import SearchBar from '../components/SearchBar.vue'
// 游戏卡片组件
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
    // 用于显示加载中
    loading.value = true
    // 调用，获取热门游戏
    const response = await getPopularGames(20) // 这里要异步等待
    // 确保响应是数组
    hotGames.value = Array.isArray(response) ? response : [] // 保证hotGames是数组
    console.log('获取到的热门游戏:', hotGames.value)
  } catch (error) {
    console.error('获取热门游戏失败:', error)
    // 发生错误时设置为空
    hotGames.value = []
  } finally {
    loading.value = false
  }
}

// 搜索游戏
const handleSearch = (query) => {
  // 跳转路由到Games，并传递搜索词
  router.push({ name: 'Games', query: { search: query } })
}

// 组件挂载时获取热门游戏
onMounted(() => {
  fetchHotGames()
})
</script>

<template>
  <div class="home">
    <!-- 标题 -->
    <div class="page-header">
      <h1>Welcome to GameHub</h1>
      <p>Discover the latest and most popular games</p>
    </div>
    
    <!-- 搜索框 -->
    <div class="search-section">
      <SearchBar @search="handleSearch" placeholder="Search for games..." />
    </div>
    
    <!-- 推荐内容 -->
    <div class="recommendation-section">
      <div class="section-header">
        <h2>Game Recommendation</h2>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <p>Loading...</p>
      </div>
      
      <!-- 无数据状态 -->
      <div v-else-if="hotGames.length === 0" class="no-data">
        <p>No game data available</p>
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
  background-position: center top; /* 固定在顶部 */
  background-repeat: no-repeat;
  background-attachment: fixed; /* 背景固定，不随内容滚动 */
  width: 100%;
  box-sizing: border-box;
  min-height: calc(100vh - 100px);
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
  background: rgba(255, 255, 255, 0.5); /* 半透明 */
  padding: 1rem;
  backdrop-filter: blur(5px); /* 模糊 */
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
</style>