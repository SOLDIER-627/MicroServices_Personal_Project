<script setup>
// 定义组件属性
const props = defineProps({
  placeholder: {
    type: String,
    default: '请输入搜索关键词...'
  },
  initialValue: {
    type: String,
    default: ''
  }
})

// 定义组件事件
const emit = defineEmits(['search'])

// 响应式数据
import { ref, watch } from 'vue'
const searchQuery = ref(props.initialValue)

// 处理搜索提交
const handleSubmit = () => {
  emit('search', searchQuery.value.trim())
}

// 监听初始值变化
watch(
  () => props.initialValue,
  (newValue) => {
    searchQuery.value = newValue
  }
)
</script>

<template>
  <div class="search-bar">
    <form @submit.prevent="handleSubmit" class="search-form">
      <input
        v-model="searchQuery"
        :placeholder="placeholder"
        type="text"
        class="search-input"
      />
      <button type="submit" class="search-button">
        <i class="fas fa-search"></i>
        <span class="button-text">搜索</span>
      </button>
    </form>
  </div>
</template>

<style scoped>
.search-bar {
  width: 100%;
}

.search-form {
  display: flex;
  border: 2px solid #3498db;
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.search-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  outline: none;
  font-size: 1rem;
  background: white;
}

.search-input::placeholder {
  color: #bdc3c7;
}

.search-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background 0.3s ease;
}

.search-button:hover {
  background: #2980b9;
}

.button-text {
  display: none;
}

@media (min-width: 1024px) {
  .button-text {
    display: inline;
  }
}
</style>