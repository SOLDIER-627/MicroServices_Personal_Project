<script setup>
// 导入工具函数
import { formatDate } from '../utils/format'

// 定义组件属性
const props = defineProps({
  game: {
    type: Object,
    required: true
  }
})

// 定义组件事件
const emit = defineEmits(['click'])
</script>

<template>
  <div class="game-card" @click="emit('click')">
    <div class="card-image">
      <img 
        :src="game.background_image" 
        :alt="game.name"
        class="game-image"
        v-if="game.background_image"
        @error="($event) => {
          // 图片加载失败时的处理
          $event.target.style.display = 'none';
          $event.target.nextElementSibling.style.display = 'flex';
        }"
      >
      <div class="placeholder-image" v-show="!game.background_image || game.background_image === ''">
        <span>暂无图片</span>
      </div>
      <div class="rating-badge" v-if="game.rating">
        {{ game.rating.toFixed(1) }}
      </div>
    </div>
    
    <div class="card-content">
      <h3 class="game-title">{{ game.name }}</h3>
      
      <div class="game-meta">
        <div class="meta-item" v-if="game.released || game.first_release_date">
          <i class="far fa-calendar"></i>
          <span>{{ formatDate(game.released || game.first_release_date) }}</span>
        </div>
        
        <div class="meta-item">
          <i class="fas fa-gamepad"></i>
          <span>{{ game.platforms?.length || 0 }} 个平台</span>
        </div>
      </div>
      
      <p class="game-description" v-if="game.summary || game.short_description">
        {{ game.summary || game.short_description }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.game-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  background-color: #f8f9fa; /* 添加背景色以防图片加载失败 */
}

.game-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.game-card:hover .game-image {
  transform: scale(1.05);
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecf0f1;
  color: #7f8c8d;
  font-size: 1rem;
}

.rating-badge {
  position: absolute;
  top: 10px;
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

.game-title {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #2c3e50;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.game-meta {
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

.game-description {
  color: #34495e;
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-image {
    height: 150px;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .game-title {
    font-size: 1.1rem;
  }
}
</style>