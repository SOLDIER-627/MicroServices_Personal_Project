<script setup>
import { ref, onMounted } from 'vue'
// 导入 API 方法
import { getNews } from '../api'

// 响应式数据
const newsList = ref([]) // 新闻列表
const loading = ref(false) // 加载状态

// 获取新闻数据
const fetchNews = async () => {
  try {
    loading.value = true
    // 调用api获取新闻数据
    const response = await getNews()
    newsList.value = response.articles || []
  } catch (error) {
    console.error('获取新闻失败:', error)
  } finally {
    loading.value = false
  }
}
// 组件挂载时获取新闻
onMounted(() => {
  fetchNews()
})
</script>

<template>
  <div class="news">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>游戏新闻与资讯</h1>
      <p>最新的游戏行业动态和资讯</p>
    </div>
    
    <!-- 新闻列表 -->
    <div class="news-section">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading">
        <p>正在加载新闻...</p>
      </div>
      
      <!-- 新闻列表 -->
      <div v-else class="news-list">
        <div 
          v-for="(article, index) in newsList" 
          :key="index" 
          class="news-item"
        >
          <!-- 如果有图片则显示 -->
          <div v-if="article.urlToImage" class="news-image">
            <img :src="article.urlToImage" :alt="article.title" />
          </div>
          <div class="news-content">
            <h3 class="news-title">
              <a :href="article.url" target="_blank">{{ article.title }}</a>
            </h3>
            <p class="news-description">{{ article.description }}</p>
            <div class="news-meta">
              <span class="source">{{ article.source?.name }}</span>
              <span class="date">{{ article.publishedAt }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.news {
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

.news-section {
  margin-top: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.news-item {
  display: flex;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.news-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.news-image {
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.news-image img {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.news-content {
  flex: 1;
}

.news-title {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.news-title a {
  color: #2c3e50;
  text-decoration: none;
  font-size: 1.3rem;
  font-weight: 600;
}

.news-title a:hover {
  color: #42b883;
}

.news-description {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #95a5a6;
}

.source {
  font-weight: 500;
}

.date {
  font-style: italic;
}
</style>