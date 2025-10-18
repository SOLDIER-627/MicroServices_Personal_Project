import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 健康检查路由
app.get('/api/health', (res) => {
  res.json({ status: 'OK', message: '服务器运行正常' });
});

// GiantBomb API代理路由
app.use('/api/giantbomb', async (req, res) => {
  try {
    // 正确提取路径 - 保留完整的路径
    const fullPath = req.url; // 例如: /games
    const apiPath = fullPath.startsWith('/') ? fullPath.substring(1) : fullPath; // 移除开头的斜杠
    
    // 构建目标URL
    const apiUrl = `https://www.giantbomb.com/api/${apiPath}`;
    
    // 转发查询参数
    const params = { 
      ...req.query,
      format: 'json'  // 明确要求 JSON 格式
    };
    
    // 添加API密钥（从环境变量获取）
    if (process.env.GIANTBOMB_API_KEY) {
      params.api_key = process.env.GIANTBOMB_API_KEY;
    }
    
    // 确保必要的参数存在
    if (!params.api_key) {
      console.error('缺少GiantBomb API密钥');
      return res.status(500).json({ 
        error: '服务器配置错误', 
        message: '缺少GiantBomb API密钥' 
      });
    }
    
    console.log('向GiantBomb API发送请求:', {
      url: apiUrl,
      params: params
    });
    
     // 发送请求到GiantBomb API
     const response = await axios.get(apiUrl, {
      params: params,
      headers: {
        'User-Agent': 'GameHub/1.0 (https://gamehub.example.com)',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('GiantBomb API响应状态:', response.status);
    console.log('GiantBomb API响应数据大小:', JSON.stringify(response.data).length);
    
    // 检查响应数据
    if (!response.data) {
      console.warn('GiantBomb API返回空数据');
      return res.json({ results: [] });
    }
    
    // 返回响应
    res.json(response.data);
  } catch (error) {
    console.error('GiantBomb API请求失败:', error.message);
    console.error('错误详情:', {
      code: error.code,
      responseStatus: error.response?.status,
      responseData: error.response?.data
    });
    
    if (error.response) {
      // 如果是API返回的错误，将错误信息转发给客户端
      res.status(error.response.status).json({
        error: 'GiantBomb API错误',
        message: error.message,
        status: error.response.status,
        data: error.response.data
      });
    } else {
      // 其他类型的错误
      res.status(500).json({ 
        error: '请求GiantBomb API失败', 
        message: error.message 
      });
    }
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`API服务器运行在端口 ${PORT}`);
  console.log(`GiantBomb API代理: http://localhost:${PORT}/api/giantbomb/`);
});