const { nodeCache, CACHE_CONFIG } = require('../config/cache');

class CacheManager {
  constructor() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
  }

  /**
   * Get data from cache (node-cache only)
   */
  async get(key) {
    try {
      const nodeData = nodeCache.get(key);
      if (nodeData !== undefined) {
        this.stats.hits++;
        console.log(`Cache HIT: ${key}`);
        return nodeData;
      }

      this.stats.misses++;
      console.log(`Cache MISS: ${key}`);
      return null;
    } catch (error) {
      this.stats.errors++;
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set data in cache (node-cache only)
   */
  async set(key, data, ttl = CACHE_CONFIG.TTL.PROJECTS) {
    try {
      nodeCache.set(key, data, ttl);
      this.stats.sets++;
      console.log(`Cache SET: ${key} (TTL: ${ttl}s)`);
      return true;
    } catch (error) {
      this.stats.errors++;
      console.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete specific key from cache
   */
  async delete(key) {
    try {
      nodeCache.del(key);
      this.stats.deletes++;
      console.log(`Cache DELETE: ${key}`);
      return true;
    } catch (error) {
      this.stats.errors++;
      console.error(`Cache DELETE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Invalidate cache keys matching a pattern
   */
  async invalidatePattern(pattern) {
    try {
      const nodeKeys = nodeCache.keys();
      const matchingNodeKeys = nodeKeys.filter(key => key.includes(pattern));
      matchingNodeKeys.forEach(key => {
        nodeCache.del(key);
      });
      
      console.log(`Cache INVALIDATE pattern "${pattern}": ${matchingNodeKeys.length} keys deleted`);
      return matchingNodeKeys.length;
    } catch (error) {
      this.stats.errors++;
      console.error(`Cache INVALIDATE error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Clear all cache data
   */
  async clear() {
    try {
      nodeCache.flushAll();
      console.log('Cache CLEAR: All cache data cleared');
      return true;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache CLEAR error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const nodeStats = nodeCache.getStats();
    return {
      ...this.stats,
      nodeCache: {
        keys: nodeStats.keys,
        hits: nodeStats.hits,
        misses: nodeStats.misses,
        ksize: nodeStats.ksize,
        vsize: nodeStats.vsize
      },
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }

  /**
   * Warm cache with essential data
   */
  async warmCache(dataLoaders) {
    console.log('Starting cache warming...');
    
    try {
      const promises = [];
      
      // Warm projects cache
      if (dataLoaders.projects) {
        promises.push(
          dataLoaders.projects().then(data => 
            this.set('projects:all', data, CACHE_CONFIG.TTL.PROJECTS)
          )
        );
      }
      
      // Warm categories cache
      if (dataLoaders.categories) {
        promises.push(
          dataLoaders.categories().then(data => 
            this.set('categories:all', data, CACHE_CONFIG.TTL.CATEGORIES)
          )
        );
      }
      
      // Warm gallery cache
      if (dataLoaders.gallery) {
        promises.push(
          dataLoaders.gallery().then(data => 
            this.set('gallery:all', data, CACHE_CONFIG.TTL.GALLERY)
          )
        );
      }
      
      await Promise.all(promises);
      console.log('Cache warming completed successfully');
    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }

  /**
   * Health check for cache system
   */
  async healthCheck() {
    const health = {
      nodeCache: true,
      overall: true
    };
    
    try {
      // Test node cache
      const testKey = 'health_check_' + Date.now();
      nodeCache.set(testKey, 'test', 1);
      const nodeResult = nodeCache.get(testKey);
      health.nodeCache = nodeResult === 'test';
      nodeCache.del(testKey);
      health.overall = health.nodeCache;
    } catch (error) {
      console.error('Cache health check failed:', error);
      health.overall = false;
    }
    
    return health;
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

module.exports = cacheManager;