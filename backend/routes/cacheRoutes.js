const express = require('express');
const router = express.Router();
const cacheManager = require('../services/CacheManager');
const { initializeRedis } = require('../config/cache');

/**
 * Get cache statistics
 * @route GET /api/cache/stats
 * @access Public (consider adding auth in production)
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = cacheManager.getStats();
    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics',
      error: error.message
    });
  }
});

/**
 * Health check for cache system
 * @route GET /api/cache/health
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    const health = await cacheManager.healthCheck();
    const status = health.overall ? 200 : 503;
    
    res.status(status).json({
      success: health.overall,
      health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cache health check failed',
      error: error.message
    });
  }
});

/**
 * Clear all cache data
 * @route DELETE /api/cache/clear
 * @access Private (add proper authentication)
 */
router.delete('/clear', async (req, res) => {
  try {
    const success = await cacheManager.clear();
    
    if (success) {
      res.json({
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
});

/**
 * Invalidate cache by pattern
 * @route DELETE /api/cache/invalidate/:pattern
 * @access Private (add proper authentication)
 */
router.delete('/invalidate/:pattern', async (req, res) => {
  try {
    const { pattern } = req.params;
    const deletedCount = await cacheManager.invalidatePattern(pattern);
    
    res.json({
      success: true,
      message: `Invalidated ${deletedCount} cache entries`,
      pattern,
      deletedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to invalidate cache',
      error: error.message
    });
  }
});

/**
 * Warm cache with fresh data
 * @route POST /api/cache/warm
 * @access Private (add proper authentication)
 */
router.post('/warm', async (req, res) => {
  try {
    // Import models for cache warming
    const Project = require('../models/Project');
    const Category = require('../models/Category');
    const Gallery = require('../models/Gallery');
    
    const dataLoaders = {
      projects: () => Project.find(),
      categories: () => Category.find(),
      gallery: () => Gallery.find()
    };
    
    await cacheManager.warmCache(dataLoaders);
    
    res.json({
      success: true,
      message: 'Cache warming completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cache warming failed',
      error: error.message
    });
  }
});

/**
 * Get cache info
 * @route GET /api/cache/info
 * @access Public
 */
router.get('/info', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Cache system running with node-cache (in-memory)',
      type: 'node-cache',
      features: [
        'Ultra-fast memory caching',
        'Automatic TTL expiration',
        'Pattern-based invalidation',
        'Cache statistics',
        'No external dependencies'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache info',
      error: error.message
    });
  }
});

module.exports = router;