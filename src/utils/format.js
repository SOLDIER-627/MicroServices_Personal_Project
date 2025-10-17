/**
 * 格式化日期
 * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
 * @returns {string} 格式化后的日期 (YYYY年MM月DD日)
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '未知日期'
  
  try {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  } catch (error) {
    console.error('日期格式化失败:', error)
    return '无效日期'
  }
}

/**
 * 格式化数字（添加千位分隔符）
 * @param {number} num - 数字
 * @returns {string} 格式化后的数字
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 截断文本
 * @param {string} text - 文本
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的文本
 */
export const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * 格式化评分
 * @param {number} rating - 评分 (0-5)
 * @returns {string} 格式化后的评分
 */
export const formatRating = (rating) => {
  if (rating === null || rating === undefined) return 'N/A'
  return rating.toFixed(1)
}

/**
 * 格式化价格
 * @param {number} price - 价格（单位：分）
 * @param {string} currency - 货币符号
 * @returns {string} 格式化后的价格
 */
export const formatPrice = (price, currency = '¥') => {
  if (price === null || price === undefined) return '免费'
  return `${currency}${(price / 100).toFixed(2)}`
}

export default {
  formatDate,
  formatNumber,
  truncateText,
  formatRating,
  formatPrice
}