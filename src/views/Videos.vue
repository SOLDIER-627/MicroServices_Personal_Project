<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
// 导入组件
import SearchBar from '../components/SearchBar.vue'
// 导入 API 方法
import { getPopularGameVideos, searchYoutubeVideos } from '../api'

// 获取路由实例
const route = useRoute()

// 响应式数据
const videos = ref([]) // 视频列表
const loading = ref(false) // 加载状态
const searchQuery = ref('') // 搜索关键词
const error = ref(null) // 错误信息

// 获取视频列表
const fetchVideos = async () => {
  try {
    error.value = null
    loading.value = true
    let response;
    
    // 如果有搜索关键词，则搜索视频，否则获取热门视频
    if (searchQuery.value) {
      response = await searchYoutubeVideos(searchQuery.value, null, 20)
    } else {
      response = await getPopularGameVideos(20)
    }
    
    videos.value = response.results || []
    
  } catch (err) {
    console.error('获取视频列表失败:', err)
    error.value = '获取视频列表失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 处理搜索事件
const handleSearch = (query) => {
  searchQuery.value = query
  fetchVideos()
}

// 监听路由查询参数变化
watch(
  () => route.query,
  (newQuery) => {
    searchQuery.value = newQuery.search || ''
    fetchVideos()
  },
  { immediate: true }
)

// 组件挂载时获取视频列表
onMounted(() => {
  // 从路由查询参数获取搜索关键词
  searchQuery.value = route.query.search || ''
  fetchVideos()
})

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="videos">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>Game Videos</h1>
      <p>Discover the latest game-related video content</p>
    </div>
    
    <!-- 搜索区域 -->
    <div class="search-container">
      <SearchBar 
        @search="handleSearch" 
        :initial-value="searchQuery"
        placeholder="Search for game videos..."
      />
    </div>
    
    <!-- 视频列表 -->
    <div class="videos-section">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <p>Loading...</p>
      </div>
      
      <!-- 错误信息 -->
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
        <button @click="fetchVideos" class="retry-btn">Retry</button>
      </div>
      
      <!-- 结果统计 -->
      <div v-else-if="videos.length > 0" class="results-info">
        <p>Found {{ videos.length }} videos</p>
      </div>
      
      <!-- 视频列表 -->
      <div v-if="!loading && !error && videos.length > 0" class="videos-grid">
        <div 
          v-for="video in videos" 
          :key="video.id" 
          class="video-card"
        >
          <div class="card-image">
            <a :href="video.url" target="_blank">
              <img 
                :src="video.pic" 
                :alt="video.title"
                class="video-image"
              >
            </a>
          </div>
          
          <div class="card-content">
            <h3 class="video-title">
              <a :href="video.url" target="_blank">{{ video.title }}</a>
            </h3>
            
            <div class="video-meta">
              <div class="meta-item">
                <i class="fas fa-user"></i>
                <span>{{ video.author }}</span>
              </div>
              
              <div class="meta-item">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(video.createdAt) }}</span>
              </div>
            </div>
            
            <p class="video-description">{{ video.description }}</p>
          </div>
        </div>
      </div>
      
      <!-- 无结果 -->
      <div v-else-if="!loading && !error && videos.length === 0" class="no-results">
        <p>No related videos found</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.videos {
  padding: 2rem 0;
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

.search-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 2rem;
  width: 60%;
}

.videos-section {
  margin-top: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #2980b9;
}

.results-info {
  margin-bottom: 1rem;
  color: #7f8c8d;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.video-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.video-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-card:hover .video-image {
  transform: scale(1.05);
}

.duration-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
}

.card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #2c3e50;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-title a {
  color: inherit;
  text-decoration: none;
}

.video-title a:hover {
  color: #3498db;
}

.video-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.video-description {
  color: #34495e;
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-size: 1.2rem;
}
</style>