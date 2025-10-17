<script setup>
// 定义组件属性
const props = defineProps({
  game: {
    type: Object, // 数据类型是对象
    required: true // 游戏数据是必填项，父组件需要传递
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
    </div>
    
    <div class="card-content">
      <h3 class="game-title">{{ game.name }}</h3>
      <div class="meta-item" v-if="game.released || game.first_release_date">
        <i class="far fa-calendar"></i>
        <span>{{ game.released || game.first_release_date }}</span>
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
}

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  background-color: #f8f9fa;
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

.meta-item {
  display: flex;
  align-items: center;
  gap:1 rem;
  justify-content: center;
}

.game-description {
  color: #34495e;
  line-height: 1.6;
  margin: 0.5;
  flex: 1;
}
</style>