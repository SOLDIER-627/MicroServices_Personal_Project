<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// 导入工具函数
import { formatDate } from '../utils/format'
// 导入 API 方法
import { getGameDetails, getGameScreenshots, getWikipediaGameInfo, getWikipediaGameImages } from '../api'

// 获取路由参数
const route = useRoute()

// 响应式数据
const game = ref(null) // 游戏详情
const screenshots = ref([]) // 游戏截图
const wikipediaInfo = ref(null) // 维基百科信息
const wikipediaImages = ref([]) // 维基百科图片
const loading = ref(true) // 加载状态
const activeTab = ref('overview') // 当前活动标签页

// 获取游戏详情
const fetchGameDetails = async () => {
  try {
    loading.value = true
    const gameId = route.params.id
    
    // 先获取游戏详情
    const detailsResponse = await getGameDetails(gameId).catch(error => {
      console.error('获取游戏详情失败:', error)
      return null
    })
    
    if (!detailsResponse) {
      game.value = null
      loading.value = false
      return
    }
    
    // 并行获取其他数据
    const [screenshotsResponse, wikiInfoResponse, wikiImagesResponse] = await Promise.all([
      getGameScreenshots(gameId).catch(error => {
        console.error('获取游戏截图失败:', error)
        return { results: [] }
      }),
      getWikipediaGameInfo(detailsResponse.name).catch(error => {
        console.error('获取维基百科信息失败:', error)
        return null
      }),
      getWikipediaGameImages(detailsResponse.name).catch(error => {
        console.error('获取维基百科图片失败:', error)
        return []
      })
    ])
    
    game.value = detailsResponse
    screenshots.value = screenshotsResponse.results || []
    wikipediaInfo.value = wikiInfoResponse
    wikipediaImages.value = wikiImagesResponse
    
  } catch (error) {
    console.error('获取游戏详情失败:', error)
    game.value = null
  } finally {
    loading.value = false
  }
}

// 格式化游戏描述（移除HTML标签）
const formatDescription = (description) => {
  if (!description) return ''
  return description.replace(/<[^>]*>/g, '')
}

// 组件挂载时获取游戏详情
onMounted(() => {
  fetchGameDetails()
})
</script>

<template>
  <div class="game-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <p>正在加载游戏详情...</p>
    </div>
    
    <!-- 游戏详情内容 -->
    <div v-else-if="game" class="detail-content">
      <!-- 游戏头部信息 -->
      <div class="game-header">
        <div class="cover-container">
          <img 
            :src="game.background_image" 
            :alt="game.name"
            class="game-cover"
            v-if="game.background_image"
          >
          <div class="placeholder-cover" v-else>
            <span>暂无图片</span>
          </div>
        </div>
        
        <div class="game-info">
          <h1 class="game-title">{{ game.name }}</h1>
          
          <div class="game-meta">
            <div class="meta-item">
              <span class="label">发行日期:</span>
              <span class="value">{{ formatDate(game.released) || '未知' }}</span>
            </div>
            
            <div class="meta-item" v-if="game.developers && game.developers.length > 0">
              <span class="label">开发商:</span>
              <span class="value">{{ game.developers[0].name || '未知' }}</span>
            </div>
            
            <div class="meta-item" v-if="game.publishers && game.publishers.length > 0">
              <span class="label">发行商:</span>
              <span class="value">{{ game.publishers[0].name || '未知' }}</span>
            </div>
            
            <div class="meta-item" v-if="game.platforms && game.platforms.length > 0">
              <span class="label">平台:</span>
              <div class="platforms">
                <span 
                  v-for="platform in game.platforms" 
                  :key="platform.platform.id"
                  class="platform"
                >
                  {{ platform.platform.name }}
                </span>
              </div>
            </div>
            
            <div class="meta-item" v-if="game.genres && game.genres.length > 0">
              <span class="label">类型:</span>
              <div class="genres">
                <span 
                  v-for="genre in game.genres" 
                  :key="genre.id"
                  class="genre"
                >
                  {{ genre.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 标签页导航 -->
      <div class="tabs">
        <button 
          :class="['tab', { active: activeTab === 'overview' }]"
          @click="activeTab = 'overview'"
        >
          概览
        </button>
        <button 
          :class="['tab', { active: activeTab === 'screenshots' }]"
          @click="activeTab = 'screenshots'"
          v-if="screenshots.length > 0 || wikipediaImages.length > 0"
        >
          图片
        </button>
      </div>
      
      <!-- 标签页内容 -->
      <div class="tab-content">
        <!-- 概览 -->
        <div v-show="activeTab === 'overview'" class="tab-pane">
          <!-- GiantBomb 游戏简介 -->
          <div class="section" v-if="game.description_raw || game.summary">
            <h2>游戏简介 (GiantBomb)</h2>
            <p class="description">{{ formatDescription(game.description_raw || game.description || game.summary) }}</p>
          </div>
          
          <!-- 维基百科信息 -->
          <div class="section" v-if="wikipediaInfo">
            <h2>相关信息 (维基百科)</h2>
            <div class="wikipedia-content">
              <div class="wiki-thumbnail" v-if="wikipediaInfo.thumbnail">
                <img :src="wikipediaInfo.thumbnail" :alt="wikipediaInfo.title" class="wiki-image">
              </div>
              <div class="wiki-text">
                <p class="description">{{ wikipediaInfo.description || wikipediaInfo.extract }}</p>
                <a :href="wikipediaInfo.pageUrl" target="_blank" class="wiki-link" v-if="wikipediaInfo.pageUrl">
                  查看维基百科页面
                </a>
              </div>
            </div>
          </div>
          
          <!-- 详细信息 -->
          <div class="section" v-if="game.website">
            <h2>详细信息</h2>
            <div class="details-grid">
              <div class="detail-item" v-if="game.website">
                <span class="label">官方网站:</span>
                <a :href="game.website" target="_blank" class="link">{{ game.website }}</a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 图片 -->
        <div v-show="activeTab === 'screenshots'" class="tab-pane">
          <!-- GiantBomb 截图 -->
          <div class="section" v-if="screenshots.length > 0">
            <h2>游戏截图 (GiantBomb)</h2>
            <div class="media-grid">
              <div 
                v-for="screenshot in screenshots" 
                :key="screenshot.id"
                class="media-item"
              >
                <img 
                  :src="screenshot.image" 
                  :alt="`游戏截图 ${screenshot.id}`"
                  class="screenshot"
                >
              </div>
            </div>
          </div>
          
          <!-- 维基百科图片 -->
          <div class="section" v-if="wikipediaImages.length > 0">
            <h2>相关图片 (维基百科)</h2>
            <div class="media-grid">
              <div 
                v-for="(image, index) in wikipediaImages" 
                :key="index"
                class="media-item"
              >
                <img 
                  :src="image.thumbnail" 
                  :alt="image.description"
                  class="screenshot"
                >
                <div class="image-info">
                  <p class="image-description">{{ image.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else class="error">
      <p>无法加载游戏详情</p>
    </div>
  </div>
</template>

<style scoped>
.game-detail {
  padding: 2rem 0;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-size: 1.2rem;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 游戏头部 */
.game-header {
  display: flex;
  gap: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cover-container {
  flex-shrink: 0;
}

.game-cover {
  width: 300px;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.placeholder-cover {
  width: 300px;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecf0f1;
  border-radius: 8px;
  color: #7f8c8d;
  font-size: 1.2rem;
}

.game-info {
  flex: 1;
}

.game-title {
  font-size: 2.5rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.game-meta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: flex-start;
}

.label {
  font-weight: 600;
  width: 100px;
  color: #7f8c8d;
}

.value {
  flex: 1;
  color: #2c3e50;
}

.platforms, .genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.platform, .genre {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* 标签页 */
.tabs {
  display: flex;
  border-bottom: 2px solid #ecf0f1;
}

.tab {
  padding: 1rem 2rem;
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 500;
  color: #7f8c8d;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab:hover {
  color: #2c3e50;
}

.tab.active {
  color: #3498db;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: #3498db;
}

/* 标签页内容 */
.tab-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.section {
  margin-bottom: 3rem;
}

.section h2 {
  font-size: 1.8rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  border-left: 4px solid #3498db;
  padding-left: 1rem;
}

.description {
  line-height: 1.8;
  color: #34495e;
  white-space: pre-wrap;
}

/* 维基百科内容 */
.wikipedia-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.wiki-thumbnail {
  flex-shrink: 0;
}

.wiki-image {
  width: 200px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.wiki-text {
  flex: 1;
}

.wiki-link {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  margin-top: 1rem;
  display: inline-block;
}

.wiki-link:hover {
  text-decoration: underline;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.detail-item .label {
  width: 120px;
  font-weight: 500;
}

.link {
  color: #3498db;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

/* 媒体网格 */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.media-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.media-item:hover {
  transform: translateY(-5px);
}

.screenshot {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-info {
  padding: 1rem;
  background: white;
}

.image-description {
  margin: 0;
  font-size: 0.9rem;
  color: #7f8c8d;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .game-detail {
    padding: 1rem 0;
  }
  
  .game-header {
    flex-direction: column;
    padding: 1rem;
  }
  
  .cover-container {
    align-self: center;
  }
  
  .game-cover, .placeholder-cover {
    width: 250px;
    height: 350px;
  }
  
  .game-title {
    font-size: 2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .tab {
    padding: 0.75rem 1rem;
  }
  
  .media-grid {
    grid-template-columns: 1fr;
  }
  
  .wikipedia-content {
    flex-direction: column;
  }
  
  .wiki-image {
    width: 100%;
    max-width: 300px;
  }
}
</style>