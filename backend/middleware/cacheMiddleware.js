const cacheManager = require('../services/CacheManager');
const { CACHE_CONFIG } = require('../config/cache');

/**
 * Middleware to cache GET responses
 */
const cacheResponse = (keyGenerator, ttl = CACHE_CONFIG.TTL.PROJECTS) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : keyGenerator;

      // Try to get cached data
      const cachedData = await cacheManager.get(cacheKey);
      
      if (cachedData) {
        // Set cache headers
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${ttl}`,
          'ETag': `"${Buffer.from(JSON.stringify(cachedData)).toString('base64')}"`
        });
        
        return res.json(cachedData);
      }

      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response data
        cacheManager.set(cacheKey, data, ttl);
        
        // Set cache headers
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${ttl}`,
          'ETag': `"${Buffer.from(JSON.stringify(data)).toString('base64')}"`
        });
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Middleware to invalidate cache on data modifications
 */
const invalidateOnUpdate = (patterns) => {
  return async (req, res, next) => {
    // Store original response methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override response methods to invalidate cache after successful operations
    const invalidateCache = async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const patternsToInvalidate = typeof patterns === 'function' 
            ? patterns(req) 
            : patterns;
          
          if (Array.isArray(patternsToInvalidate)) {
            for (const pattern of patternsToInvalidate) {
              await cacheManager.invalidatePattern(pattern);
            }
          } else if (patternsToInvalidate) {
            await cacheManager.invalidatePattern(patternsToInvalidate);
          }
        } catch (error) {
          console.error('Cache invalidation error:', error);
        }
      }
    };
    
    res.json = function(data) {
      invalidateCache();
      return originalJson.call(this, data);
    };
    
    res.send = function(data) {
      invalidateCache();
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware to handle conditional requests (ETags)
 */
const handleConditionalRequests = () => {
  return (req, res, next) => {
    const ifNoneMatch = req.get('If-None-Match');
    
    if (ifNoneMatch) {
      // Store original json method
      const originalJson = res.json;
      
      res.json = function(data) {
        const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64')}"`;
        
        if (ifNoneMatch === etag) {
          return res.status(304).end();
        }
        
        res.set('ETag', etag);
        return originalJson.call(this, data);
      };
    }
    
    next();
  };
};

/**
 * Cache warming middleware for critical routes
 */
const warmCacheOnStartup = (dataLoaders) => {
  return async (req, res, next) => {
    // Only warm cache once per server startup
    if (!warmCacheOnStartup.warmed) {
      warmCacheOnStartup.warmed = true;
      
      // Warm cache in background
      setImmediate(async () => {
        try {
          await cacheManager.warmCache(dataLoaders);
        } catch (error) {
          console.error('Background cache warming failed:', error);
        }
      });
    }
    
    next();
  };
};

module.exports = {
  cacheResponse,
  invalidateOnUpdate,
  handleConditionalRequests,
  warmCacheOnStartup
};