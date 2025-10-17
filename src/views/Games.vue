<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 导入组件
import SearchBar from '../components/SearchBar.vue'
import GameCard from '../components/GameCard.vue'
// 导入 API 方法
import { searchGames } from '../api'

// 获取路由实例
const route = useRoute() // 获取路由参数
const router = useRouter() // 获取路由实例

// 响应式数据
const games = ref([]) // 游戏列表
const loading = ref(false) // 加载状态
const searchQuery = ref('') // 搜索关键词

// 获取游戏列表
const fetchGames = async () => {
  try {
    loading.value = true
    // 调用 API 获取游戏数据
    const response = await searchGames(searchQuery.value, 20)
    games.value = response || []
  } catch (error) {
    console.error('获取游戏列表失败:', error)
    games.value = []
  } finally {
    loading.value = false
  }
}

// 处理搜索事件
const handleSearch = (query) => {
  searchQuery.value = query
  fetchGames()
}

// 监听路由查询参数变化
watch(
  () => route.query,
  (newQuery) => {
    const newSearchQuery = newQuery.search || ''
    searchQuery.value = newSearchQuery
    
    // 只有当有搜索关键词时才触发搜索
    if (newSearchQuery) {
      fetchGames()
    } else {
      // 如果没有搜索关键词，清空游戏列表
      games.value = []
    }
  },
  { immediate: true }
)

// 组件挂载时获取游戏列表
onMounted(() => {
  // 从路由查询参数获取搜索关键词
  searchQuery.value = route.query.search || ''
  // 只有当有搜索关键词时才触发搜索
  if (searchQuery.value) {
    fetchGames()
  }
})
</script>

<template>
  <div class="games">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>全部游戏</h1>
      <p>浏览和搜索所有游戏</p>
    </div>
    
    <!-- 搜索区域 -->
    <div class="filters-section">
      <div class="search-container">
        <SearchBar 
          @search="handleSearch" 
          :initial-value="searchQuery"
          placeholder="搜索游戏..."
        />
      </div>
    </div>
    
    <!-- 游戏列表 -->
    <div class="games-section">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <p>正在加载游戏...</p>
      </div>
      
      <!-- 结果统计 -->
      <div v-else-if="games.length > 0" class="results-info">
        <p>共找到 {{ games.length }} 个游戏</p>
      </div>
      
      <!-- 游戏列表 -->
      <div v-if="!loading && games.length > 0" class="games-grid">
        <GameCard 
          v-for="game in games" 
          :key="game.id" 
          :game="game"
          @click="() => router.push({ name: 'GameDetail', params: { id: game.id } })"
        />
      </div>
      
      <!-- 无结果 -->
      <div v-else-if="!loading && games.length === 0" class="no-results">
        <p>没有找到相关游戏</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.games {
  padding: 2rem 2rem;
  min-height: calc(100vh - 100px);
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.page-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.filters-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-container {
  flex: 1;
  max-width: 500px;
}

.games-section {
  margin-top: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.results-info {
  margin-bottom: 1rem;
  color: #7f8c8d;
  font-weight: 500;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-size: 1.2rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .games {
    padding: 1rem 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .filters-section {
    padding: 1rem;
  }
  
  .search-container {
    width: 100%;
    max-width: 100%;
  }
  
  .games-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
}
</style>