import axios from 'axios'

/* GiantBomb API */
// 使用Vite代理配置
const giantbombApiClient = axios.create({
  baseURL: '/api/giantbomb',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',  // 确保请求 JSON
    'Content-Type': 'application/json'
  }
})

// 添加响应拦截器用于调试
giantbombApiClient.interceptors.response.use(
  response => {
    console.log('API响应:', response.config.url, response.status, response.data);
    
    // 检查响应内容类型
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('application/xml')) {
      console.warn('收到 XML 响应而不是 JSON');
    }
    
    return response;
  },
  error => {
    console.error('API错误:', error.config?.url, error.response?.status, error.response?.data);
    
    // 检查是否是 XML 错误响应
    if (error.response && error.response.headers['content-type']?.includes('application/xml')) {
      console.error('收到 XML 错误响应');
    }
    
    return Promise.reject(error);
  }
);

// 通用的游戏数据处理函数
const processGameData = (game) => {
  console.log(`处理游戏 "${game.name}" 的图片数据:`, game.image);
  
  // 图片URL处理逻辑
  let imageUrl = null;
  if (game.image) {
    imageUrl = game.image.medium_url || 
               game.image.screen_url || 
               game.image.super_url || 
               game.image.thumb_url || 
               game.image.small_url || 
               game.image.icon_url || 
               game.image.tiny_url;
    
    // 修复协议问题
    if (imageUrl && imageUrl.startsWith('//')) {
      imageUrl = 'https:' + imageUrl;
    }
  }
  
  // 使用占位图
  if (!imageUrl) {
    imageUrl = 'https://via.placeholder.com/300x400/333/fff?text=No+Image';
  }
  
  return {
    id: game.id,
    name: game.name,
    background_image: imageUrl,
    first_release_date: game.original_release_date,
    summary: game.deck,
    rating: null
  };
};

// 获取热门游戏 - 简化版本
export const getPopularGames = async (limit = 20) => {
  try {
    console.log(`获取热门游戏，数量: ${limit}`);
    
    // 直接使用游戏端点而不是搜索端点
    const response = await giantbombApiClient.get('/games', {
      params: {
        format: 'json',  // 明确指定 JSON 格式
        field_list: 'id,name,image,original_release_date,deck',
        limit: limit,
        sort: 'date_added:desc',  // 按添加日期排序获取最新游戏
        filter: 'original_release_date:2020-01-01|2024-12-31'  // 过滤近年的游戏
      }
    });
    
    console.log('热门游戏API响应:', response.data);
    
    if (!response.data || !response.data.results) {
      console.warn('热门游戏API返回空结果');
      return [];
    }
    
    let games = response.data.results.map(processGameData);
    
    // 随机打乱游戏顺序
    games = shuffleArray(games);
    
    console.log(`处理后的热门游戏数量: ${games.length}`);
    
    return games.slice(0, limit);
    
  } catch (error) {
    console.error('获取热门游戏失败:', error);
    // 返回空数组而不是抛出错误，避免前端崩溃
    return [];
  }
};

// 数组随机打乱函数
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 搜索游戏
export const searchGames = async (searchTerm, limit = 20) => {
  try {
    console.log(`搜索游戏: "${searchTerm}"`);
    
    const response = await giantbombApiClient.get('/search', {
      params: {
        format: 'json',  // 明确指定 JSON 格式
        query: searchTerm,
        resources: 'game',
        limit: limit,
        field_list: 'id,name,image,original_release_date,deck'
      }
    });
    
    console.log('搜索游戏API响应:', response.data);
    
    if (!response.data || !response.data.results) {
      console.warn('搜索游戏API返回空结果');
      return [];
    }
    
    const games = response.data.results.map(processGameData);
    console.log(`搜索到的游戏数量: ${games.length}`);
    
    return games;
    
  } catch (error) {
    console.error('搜索游戏失败:', error);
    throw error;
  }
};

// 获取游戏详情
export const getGameDetails = async (gameId) => {
  try {
    const response = await giantbombApiClient.get(`/game/${gameId}`, {
      params: {
        format: 'json',  // 明确要求 JSON 格式
        field_list: 'id,name,deck,description,original_release_date,genres,platforms,developers,publishers,images,screenshots,videos,site_detail_url'
      }
    });
    
    console.log('GiantBomb 游戏详情API响应:', response.data);
    
    // 修复响应检查逻辑
    if (!response.data || response.data.error !== 'OK') {
      console.warn('游戏详情API响应错误:', response.data?.error);
      throw new Error('游戏详情API响应错误');
    }
    
    if (!response.data.results) {
      console.warn('游戏详情API返回空结果');
      throw new Error('游戏详情API返回空结果');
    }
    
    const game = response.data.results;
    
    // 处理封面图片
    let coverImageUrl = null;
    if (game.images) {
      const coverImage = game.images.find(img => img.tags && img.tags.includes('Box Art')) || game.images[0];
      if (coverImage) {
        coverImageUrl = coverImage.medium_url || coverImage.small_url || coverImage.screen_url || null;
        
        // 修复协议问题
        if (coverImageUrl && coverImageUrl.startsWith('//')) {
          coverImageUrl = 'https:' + coverImageUrl;
        }
      }
    }
    
    return {
      id: game.id,
      name: game.name,
      background_image: coverImageUrl,
      released: game.original_release_date,
      summary: game.deck,
      description: game.description,
      description_raw: game.description ? game.description.replace(/<[^>]*>/g, '') : '',
      genres: game.genres ? game.genres.map(genre => ({ id: genre.id, name: genre.name })) : [],
      platforms: game.platforms ? game.platforms.map(platform => ({ 
        platform: { 
          id: platform.id, 
          name: platform.name 
        }
      })) : [],
      developers: game.developers ? game.developers.map(dev => ({ id: dev.id, name: dev.name })) : [],
      publishers: game.publishers ? game.publishers.map(pub => ({ id: pub.id, name: pub.name })) : [],
      screenshots: game.screenshots ? game.screenshots.map(screenshot => {
        // 处理截图图片
        let screenshotUrl = null;
        if (screenshot.image) {
          screenshotUrl = screenshot.image.medium_url || screenshot.image.small_url || screenshot.image.screen_url || null;
          
          // 修复协议问题
          if (screenshotUrl && screenshotUrl.startsWith('//')) {
            screenshotUrl = 'https:' + screenshotUrl;
          }
        }
        
        return {
          id: screenshot.id,
          image: screenshotUrl
        };
      }) : [],
      videos: game.videos ? game.videos.map(video => {
        // 处理视频封面图片
        let previewUrl = null;
        if (video.image) {
          previewUrl = video.image.medium_url || video.image.small_url || null;
          
          // 修复协议问题
          if (previewUrl && previewUrl.startsWith('//')) {
            previewUrl = 'https:' + previewUrl;
          }
        }
        
        // 如果没有封面图片，使用YouTube默认封面
        if (!previewUrl && video.youtube_id) {
          previewUrl = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
        }
        
        return {
          id: video.id,
          name: video.name,
          external_id: video.youtube_id,
          preview: previewUrl
        };
      }) : [],
      website: game.site_detail_url,
      rating: null
    };
  } catch (error) {
    console.error('获取游戏详情失败:', error);
    throw error;
  }
}

// 获取游戏截图
export const getGameScreenshots = async (gameId, limit = 5) => {
  try {
    const response = await giantbombApiClient.get(`/game/${gameId}`, {
      params: {
        format: 'json',  // 明确要求 JSON 格式
        field_list: 'screenshots'
      }
    });
    
    console.log('GiantBomb 游戏截图API响应:', response.data);
    
    // 修复响应检查逻辑
    if (!response.data || response.data.error !== 'OK') {
      console.warn('游戏截图API响应错误:', response.data?.error);
      return { results: [] };
    }
    
    if (!response.data.results) {
      console.warn('游戏截图API返回空结果');
      return { results: [] };
    }
    
    const game = response.data.results;
    
    const screenshots = game.screenshots ? game.screenshots.slice(0, limit).map(screenshot => {
      // 处理截图图片
      let screenshotUrl = null;
      if (screenshot.image) {
        screenshotUrl = screenshot.image.medium_url || screenshot.image.small_url || screenshot.image.screen_url || null;
        
        // 修复协议问题
        if (screenshotUrl && screenshotUrl.startsWith('//')) {
          screenshotUrl = 'https:' + screenshotUrl;
        }
      }
      
      return {
        id: screenshot.id,
        image: screenshotUrl
      };
    }) : [];
    
    return {
      results: screenshots
    };
  } catch (error) {
    console.error('获取游戏截图失败:', error);
    // 返回空数组而不是抛出错误
    return { results: [] };
  }
}

/* NewsApi */
const newsApiClient = axios.create({
  baseURL: 'https://newsapi.org/v2',
  timeout: 10000
})

const NEWS_API_KEY = '42cd7124176e42bc8533622c11635fcc'
const query = '(Steam游戏 OR PlayStation游戏 OR Xbox游戏 OR Switch游戏) AND (新闻 OR 发布) -棋牌'

export const getNews = async () => {
  try {
    const response = await newsApiClient.get('/everything', {
      params: {
        q: query,
        apiKey: NEWS_API_KEY,
        language: 'zh',
        sortBy: 'publishedAt',
        pageSize: 30
      }
    })
    return response.data
  } catch (error) {
    console.error('获取新闻失败:', error)
    throw error
  }
}

/* YouTube API */
const YOUTUBE_API_KEY = 'AIzaSyAxaDL92jtahy33bDRH9SYtAds3czXSpMQ'

export const searchYoutubeVideos = async (keyword, pageToken = null, maxResults = 20) => {
  try {
    const params = {
      part: 'snippet',
      q: keyword ? `${keyword} 游戏` : '游戏',
      type: 'video',
      maxResults: maxResults,
      key: YOUTUBE_API_KEY,
      order: 'relevance',
      videoCategoryId: '20' // Gaming category
    }
    
    // 如果有分页令牌，则添加
    if (pageToken) {
      params.pageToken = pageToken
    }
    
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: params
    })
    
    // 格式化视频数据以匹配之前的B站数据结构
    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      pic: item.snippet.thumbnails.high.url,
      author: item.snippet.channelTitle,
      createdAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }))
    
    return {
      results: videos,
      nextPageToken: response.data.nextPageToken,
      prevPageToken: response.data.prevPageToken,
      totalResults: response.data.totalResults
    }
  } catch (error) {
    console.error('搜索YouTube视频失败:', error)
    throw error
  }
}

// 获取热门游戏视频
export const getPopularGameVideos = async (limit = 20) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: '游戏',
        type: 'video',
        maxResults: limit,
        key: YOUTUBE_API_KEY,
        order: 'viewCount', // 按观看次数排序
        videoCategoryId: '20' // Gaming category
      }
    })
    
    // 格式化视频数据
    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      pic: item.snippet.thumbnails.high.url,
      author: item.snippet.channelTitle,
      duration: '',
      play: 0,
      review: 0,
      createdAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }))
    
    return {
      results: videos,
      count: videos.length
    }
  } catch (error) {
    console.error('获取热门游戏视频失败:', error)
    throw error
  }
}

// ... existing code ...

/* Wikipedia API */
const wikipediaApiClient = axios.create({
  baseURL: 'https://en.wikipedia.org/w/api.php',
  timeout: 10000,
  params: {
    format: 'json',
    action: 'query',
    origin: '*'
  }
})

// 获取维基百科游戏信息
export const getWikipediaGameInfo = async (gameName) => {
  try {
    console.log(`搜索维基百科游戏信息: "${gameName}"`);
    
    // 首先搜索页面
    const searchResponse = await wikipediaApiClient.get('', {
      params: {
        list: 'search',
        srsearch: gameName,
        srlimit: 5
      }
    });
    
    if (!searchResponse.data || !searchResponse.data.query || !searchResponse.data.query.search) {
      console.warn('维基百科搜索API返回空结果');
      return null;
    }
    
    const searchResults = searchResponse.data.query.search;
    
    // 找到最相关的页面
    const relevantPage = searchResults.find(page => 
      page.title.toLowerCase().includes(gameName.toLowerCase()) ||
      page.snippet.toLowerCase().includes('video game') ||
      page.snippet.toLowerCase().includes('game')
    );
    
    if (!relevantPage) {
      console.warn('未找到相关的维基百科页面');
      return null;
    }
    
    // 获取页面内容
    const pageResponse = await wikipediaApiClient.get('', {
      params: {
        prop: 'extracts|pageimages|info',
        titles: relevantPage.title,
        exintro: true,
        explaintext: true,
        piprop: 'thumbnail',
        pithumbsize: 400,
        inprop: 'url'
      }
    });
    
    if (!pageResponse.data || !pageResponse.data.query || !pageResponse.data.query.pages) {
      console.warn('维基百科页面API返回空结果');
      return null;
    }
    
    const pages = pageResponse.data.query.pages;
    const pageId = Object.keys(pages)[0];
    const pageData = pages[pageId];
    
    if (pageId === '-1' || !pageData) {
      console.warn('维基百科页面不存在');
      return null;
    }
    
    return {
      title: pageData.title,
      extract: pageData.extract,
      thumbnail: pageData.thumbnail ? pageData.thumbnail.source : null,
      pageUrl: pageData.fullurl,
      description: pageData.extract ? pageData.extract.substring(0, 500) + '...' : null
    };
    
  } catch (error) {
    console.error('获取维基百科游戏信息失败:', error);
    return null;
  }
}

// 获取维基百科游戏图片
export const getWikipediaGameImages = async (gameName) => {
  try {
    console.log(`搜索维基百科游戏图片: "${gameName}"`);
    
    const response = await wikipediaApiClient.get('', {
      params: {
        generator: 'images',
        gimlimit: 10,
        prop: 'imageinfo',
        iiprop: 'url',
        titles: gameName
      }
    });
    
    if (!response.data || !response.data.query || !response.data.query.pages) {
      console.warn('维基百科图片API返回空结果');
      return [];
    }
    
    const pages = response.data.query.pages;
    const images = [];
    
    Object.values(pages).forEach(page => {
      if (page.imageinfo && page.imageinfo[0]) {
        const imageInfo = page.imageinfo[0];
        // 过滤掉小图标和无关图片
        if (imageInfo.url && 
            !imageInfo.url.includes('Commons-logo') &&
            !imageInfo.url.includes('Wiki') &&
            !imageInfo.url.includes('button') &&
            !imageInfo.url.includes('icon')) {
          images.push({
            url: imageInfo.url,
            description: page.title.replace('File:', ''),
            thumbnail: imageInfo.thumburl || imageInfo.url
          });
        }
      }
    });
    
    console.log(`找到维基百科图片数量: ${images.length}`);
    return images.slice(0, 10); // 返回前10张图片
    
  } catch (error) {
    console.error('获取维基百科游戏图片失败:', error);
    return [];
  }
}
