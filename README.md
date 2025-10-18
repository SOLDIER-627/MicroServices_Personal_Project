# GameHub - 一站式游戏平台
## 项目简介

GameHub是一个基于Vue 3 + Express的全栈游戏信息聚合平台，集成了多个第三方API，为用户提供全面的游戏信息、新闻资讯和视频内容。

## 配置与部署

### 环境要求
- Node.js 16.0+
- npm 或 pnpm 包管理器

### 安装依赖
```bash
# 使用pnpm（推荐）
pnpm install

# 或使用npm
npm install
```

### 配置环境变量
在项目根目录创建或编辑 `.env` 文件：
```env
# 后端专用环境变量 (Express服务器使用)
GIANTBOMB_API_KEY=你的GiantBomb_API密钥

# 前端专用环境变量 (Vite客户端使用)
VITE_NEWS_API_KEY=你的NewsAPI密钥
VITE_YOUTUBE_API_KEY=你的YouTube_API密钥

# Server Port
PORT=3001
```

### 运行项目
```bash
# 启动后端API服务器（代理GiantBomb API）
pnpm server

# 启动前端开发网页
pnpm dev
```

项目将在以下地址运行：
- 前端：http://localhost:5173
- 后端：http://localhost:3001

## 项目架构

### 技术栈
**前端技术栈：**
- Vue 3 (Composition API + `<script setup>`)
- Vue Router 4 (单页面应用路由)
- Vite (构建工具)
- Axios (HTTP客户端)

**后端技术栈：**
- Express.js (Node.js Web框架)
- CORS (跨域资源共享)

### 项目结构
```
GameHub/
├── src/                    # 前端源代码
│   ├── components/        # 可复用组件
│   ├── views/             # 页面组件
│   ├── router/            # 路由配置
│   ├── api/               # API接口封装
│   └── main.js            # 应用入口
├── server/                 # 后端服务器
│   └── index.js           # Express服务器
└── package.json           # 项目配置
```

## 功能特性

### 核心功能模块

1. **游戏搜索与浏览**
   - 基于GiantBomb API的游戏数据库
   - 游戏搜索功能
   - 游戏详情页面（包含描述、发行信息等）

2. **游戏新闻资讯**
   - 集成NewsAPI获取最新游戏行业动态
   - 分类展示游戏相关新闻
   - 支持新闻来源和发布时间显示

3. **游戏视频内容**
   - YouTube API集成
   - 游戏相关视频搜索和浏览
   - 热门游戏视频推荐

##  API集成

### 第三方API服务

| API服务 | 用途 | 是否需要API密钥 |
|--------|------|----------------|
| **GiantBomb API** | 游戏数据库，提供游戏信息和详情 | ✅ 必需 |
| **NewsAPI** | 游戏新闻和行业资讯 | ✅ 必需 |
| **YouTube API** | 游戏相关视频内容 | ✅ 必需 |
| **Wikipedia** | 游戏背景信息（无需API密钥） | ❌ 无需 |

### API密钥获取指南

#### 1. GiantBomb API密钥
1. 访问 [GiantBomb API页面](https://www.giantbomb.com/api/)
2. 注册GiantBomb账户
3. 申请API密钥（免费版有调用限制）

#### 2. NewsAPI密钥
1. 访问 [NewsAPI官网](https://newsapi.org/)
2. 注册账户获取免费API密钥

#### 3. YouTube API密钥
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用YouTube Data API v3
4. 创建API密钥

## 后端架构说明

### 后端服务器代理

GameHub采用后端服务器的主要原因是**解决CORS（跨域资源共享）限制**：

**GiantBomb API的CORS限制**
- GiantBomb API默认不允许浏览器直接调用
- 后端服务器作为代理，转发API请求
- 避免浏览器的同源策略限制


### 后端代理架构
```
前端(Vue) → 后端(Express) → GiantBomb API
        ↓
    其他API(直接调用)
```

## 项目部署

### 构建生产版本
```bash
# 构建前端静态文件
pnpm build

# 预览生产版本
pnpm preview
```
        