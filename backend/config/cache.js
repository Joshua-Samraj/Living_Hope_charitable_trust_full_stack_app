const NodeCache = require('node-cache');

// Cache configuration
const CACHE_CONFIG = {
  // TTL values in seconds
  TTL: {
    PROJECTS: 300, // 5 minutes
    GALLERY: 600, // 10 minutes
    CATEGORIES: 1800, // 30 minutes
    PROJECT_BY_ID: 300, // 5 minutes
    PROJECTS_BY_CATEGORY: 300, // 5 minutes
    GALLERY_BY_CATEGORY: 600, // 10 minutes
  },
  
  // Node cache settings
  NODE_CACHE: {
    stdTTL: 300, // Default 5 minutes
    checkperiod: 60, // Check for expired keys every 60 seconds
    useClones: false, // Don't clone objects for better performance
    maxKeys: 1000, // Maximum number of keys
  }
};

// Initialize Node.js memory cache
const nodeCache = new NodeCache(CACHE_CONFIG.NODE_CACHE);

console.log('✅ Memory cache initialized with node-cache (Redis not required)');

// Cache key generators
const generateCacheKey = (prefix, ...parts) => {
  return `${prefix}:${parts.filter(Boolean).join(':')}`;
};

const CACHE_KEYS = {
  ALL_PROJECTS: () => generateCacheKey('projects', 'all'),
  PROJECT_BY_ID: (id) => generateCacheKey('projects', 'id', id),
  PROJECTS_BY_CATEGORY: (category) => generateCacheKey('projects', 'category', category),
  ALL_GALLERY: () => generateCacheKey('gallery', 'all'),
  GALLERY_BY_CATEGORY: (category) => generateCacheKey('gallery', 'category', category),
  GALLERY_BY_ID: (id) => generateCacheKey('gallery', 'id', id),
  ALL_CATEGORIES: () => generateCacheKey('categories', 'all'),
  CATEGORY_BY_KEYWORD: (keyword) => generateCacheKey('categories', 'keyword', keyword),
};

module.exports = {
  CACHE_CONFIG,
  nodeCache,
  generateCacheKey,
  CACHE_KEYS
};