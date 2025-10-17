<script setup>
import { ref, watch } from 'vue'
// 定义组件属性
const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search for games...'
  },
  initialValue: {
    type: String,
    default: ''
  }
})

// 定义组件事件
const emit = defineEmits(['search'])

// 响应式数据
const searchQuery = ref(props.initialValue)

// 处理搜索提交
const handleSubmit = () => {
  emit('search', searchQuery.value.trim()) // trim去除首尾空格
}

watch(
  () => props.initialValue, // 监听初始值变化
  (newValue) => { // 当初始值变化时，回调
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
        <span class="button-text">Search</span>
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
  font-size: 1rem;
  font-weight: 800;
}

.search-button:hover {
  background: #2980b9;
}
</style>