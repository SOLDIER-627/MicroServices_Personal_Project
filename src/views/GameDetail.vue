<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// 导入 API 方法
import { getGameDetails, getWikipediaGameInfo, getWikipediaGameImages } from '../api'

// 获取路由参数
const route = useRoute()

// 响应式数据
const game = ref(null) // 游戏详情
const wikipediaInfo = ref(null) // 维基百科信息
const wikipediaImages = ref([]) // 维基百科图片
const loading = ref(true) // 加载状态
const activeTab = ref('overview') // 当前活动标签页

// 获取游戏详情
const fetchGameDetails = async () => {
  try {
    loading.value = true
    const gameId = route.params.id // route.params是路由的动态参数对象
    
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
    
    // 使用Promise.all并行发起两个
    const [wikiInfoResponse, wikiImagesResponse] = await Promise.all([
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
      <p>Loading game details...</p>
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
            <span>No image available</span>
          </div>
        </div>
        
        <div class="game-info">
          <h1 class="game-title">{{ game.name }}</h1>
          <div class="game-meta">
            <div class="meta-item">
              <span class="label">Release Date:</span>
              <span class="value">{{ game.released || 'Unknown' }}</span>
            </div>
            
            <div class="meta-item" v-if="game.developers && game.developers.length > 0">
              <span class="label">Developers:</span>
              <span class="value">{{ game.developers[0].name || 'Unknown' }}</span>
            </div>
            
            <div class="meta-item" v-if="game.publishers && game.publishers.length > 0">
              <span class="label">Publishers:</span>
              <span class="value">{{ game.publishers[0].name || 'Unknown' }}</span>
            </div>
            
            <div class="meta-item" v-if="game.platforms && game.platforms.length > 0">
              <span class="label">Platforms:</span>
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
              <span class="label">Types:</span>
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
          Overview
        </button>
        <button 
          :class="['tab', { active: activeTab === 'screenshots' }]"
          @click="activeTab = 'screenshots'"
          v-if="wikipediaImages.length > 0"
        >
          Images
        </button>
      </div>
      
      <!-- 标签页内容 -->
      <div class="tab-content">
        <!-- 概览 -->
        <div v-show="activeTab === 'overview'" class="tab-pane">
          <!-- 维基百科信息 -->
          <div class="section" v-if="wikipediaInfo">
            <h2>Wikipedia</h2>
            <div class="wikipedia-content">
              <div class="wiki-thumbnail" v-if="wikipediaInfo.thumbnail">
                <img :src="wikipediaInfo.thumbnail" :alt="wikipediaInfo.title" class="wiki-image">
              </div>
              <div class="wiki-text">
                <p class="description">{{ wikipediaInfo.description || wikipediaInfo.extract }}</p>
                <a :href="wikipediaInfo.pageUrl" target="_blank" class="wiki-link" v-if="wikipediaInfo.pageUrl">
                  View Wikipedia page
                </a>
              </div>
            </div>
          </div>

          <!-- GiantBomb 游戏简介 -->
          <div class="section" v-if="game.description_raw || game.summary">
            <h2>Game Introduction(GiantBomb)</h2>
            <p class="description">{{ formatDescription(game.description_raw || game.description || game.summary) }}</p>
          </div>
          
          <!-- 详细信息 -->
          <div class="section" v-if="game.website">
            <div class="details-grid">
              <div class="detail-item" v-if="game.website">
                <span class="label">GiantBomb website:</span>
                <a :href="game.website" target="_blank" class="link">{{ game.website }}</a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 图片 -->
        <div v-show="activeTab === 'screenshots'" class="tab-pane">
          <!-- 维基百科图片 -->
          <div class="section" v-if="wikipediaImages.length > 0">
            <h2>From Wikipedia</h2>
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
      <p>Failed to load game details</p>
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
  align-items: center;
}


.label {
  font-weight: 1000;
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
  justify-content: center;
  flex: 1; /* 使容器占据剩余空间 */
}

.platform, .genre {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 1rem;
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

.description {
  line-height: 1.8;
  color: #34495e;
  white-space: pre-wrap;
  text-align: left;
  text-indent: 2em;
}

/* 维基百科内容 */
.wikipedia-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  justify-content: flex-start;
}



.wiki-image {
  width: 200px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  grid-template-columns: repeat(auto-fill, minmax(1000px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.detail-item .label {
  width: 250px;
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
</style>