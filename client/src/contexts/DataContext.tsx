import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { galleryService } from '../services/galleryService';
import { categoryService } from '../services/categoryService';
import { projectService } from '../services/projectService';

interface GalleryImage {
  _id: string;
  title: string;
  category: string;
  description: string;
  url: string;
}

interface Category {
  _id: string;
  name: string;
  keyword: string;
  description?: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
}

interface CacheData {
  data: any;
  timestamp: number;
  loading: boolean;
}

interface DataContextType {
  // Gallery
  galleryImages: GalleryImage[];
  galleryLoading: boolean;
  getGalleryImages: () => Promise<GalleryImage[]>;
  refreshGalleryImages: () => Promise<void>;
  
  // Categories
  categories: Category[];
  categoriesLoading: boolean;
  getCategories: () => Promise<Category[]>;
  refreshCategories: () => Promise<void>;
  
  // Projects
  projects: Project[];
  projectsLoading: boolean;
  getProjects: () => Promise<Project[]>;
  refreshProjects: () => Promise<void>;
  
  // Cache management
  clearCache: () => void;
  isCacheValid: (key: string) => boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Cache duration in milliseconds (10 minutes for better performance)
const CACHE_DURATION = 10 * 60 * 1000;

// Background refresh threshold (refresh when cache is 80% expired)
const BACKGROUND_REFRESH_THRESHOLD = 0.8;

// localStorage keys for cache persistence
const CACHE_KEYS = {
  gallery: 'gallery_cache',
  categories: 'categories_cache',
  projects: 'projects_cache'
};

// Helper functions for localStorage cache
const saveToLocalStorage = (key: string, data: CacheData) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save cache to localStorage:', error);
  }
};

const loadFromLocalStorage = (key: string): CacheData | null => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if cache is still valid
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load cache from localStorage:', error);
  }
  return null;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [cache, setCache] = useState<Record<string, CacheData>>(() => {
    // Initialize cache with localStorage data if available
    const galleryCache = loadFromLocalStorage(CACHE_KEYS.gallery);
    const categoriesCache = loadFromLocalStorage(CACHE_KEYS.categories);
    const projectsCache = loadFromLocalStorage(CACHE_KEYS.projects);
    
    return {
      gallery: galleryCache || { data: [], timestamp: 0, loading: false },
      categories: categoriesCache || { data: [], timestamp: 0, loading: false },
      projects: projectsCache || { data: [], timestamp: 0, loading: false },
    };
  });

  const isCacheValid = useCallback((key: string): boolean => {
    const cacheEntry = cache[key];
    if (!cacheEntry || !cacheEntry.data || cacheEntry.data.length === 0) {
      return false;
    }
    const now = Date.now();
    return (now - cacheEntry.timestamp) < CACHE_DURATION;
  }, [cache]);

  const shouldBackgroundRefresh = useCallback((key: string): boolean => {
    const cacheEntry = cache[key];
    if (!cacheEntry || !cacheEntry.data || cacheEntry.data.length === 0) {
      return false;
    }
    const now = Date.now();
    const age = now - cacheEntry.timestamp;
    return age > (CACHE_DURATION * BACKGROUND_REFRESH_THRESHOLD);
  }, [cache]);

  const updateCache = useCallback((key: string, data: any, loading: boolean = false) => {
    const cacheData = {
      data,
      timestamp: loading ? Date.now() : Date.now(),
      loading
    };
    
    setCache(prev => ({
      ...prev,
      [key]: cacheData
    }));
    
    // Save to localStorage if not loading
    if (!loading && data.length > 0) {
      const storageKey = CACHE_KEYS[key as keyof typeof CACHE_KEYS];
      if (storageKey) {
        saveToLocalStorage(storageKey, cacheData);
      }
    }
  }, []);

  // Gallery methods
  const getGalleryImages = useCallback(async (): Promise<GalleryImage[]> => {
    if (isCacheValid('gallery') && !cache.gallery.loading) {
      console.log('Using cached gallery images');
      
      // Background refresh if cache is getting old
      if (shouldBackgroundRefresh('gallery')) {
        console.log('Starting background refresh for gallery images');
        setImmediate(async () => {
          try {
            const images = await galleryService.getAllImages();
            updateCache('gallery', images, false);
            console.log('Background refresh completed for gallery images');
          } catch (error) {
            console.warn('Background refresh failed for gallery images:', error);
          }
        });
      }
      
      return cache.gallery.data;
    }

    if (cache.gallery.loading) {
      console.log('Gallery fetch already in progress, waiting...');
      // Wait for the current fetch to complete
      return new Promise((resolve) => {
        const checkCache = () => {
          if (!cache.gallery.loading) {
            resolve(cache.gallery.data);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    try {
      console.log('Fetching fresh gallery images from API');
      updateCache('gallery', cache.gallery.data, true);
      const images = await galleryService.getAllImages();
      updateCache('gallery', images, false);
      return images;
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      updateCache('gallery', cache.gallery.data, false);
      throw error;
    }
  }, [cache.gallery, isCacheValid, shouldBackgroundRefresh, updateCache]);

  const refreshGalleryImages = useCallback(async (): Promise<void> => {
    try {
      console.log('Force refreshing gallery images');
      updateCache('gallery', [], true);
      const images = await galleryService.getAllImages();
      updateCache('gallery', images, false);
    } catch (error) {
      console.error('Error refreshing gallery images:', error);
      updateCache('gallery', cache.gallery.data, false);
      throw error;
    }
  }, [cache.gallery.data, updateCache]);

  // Categories methods
  const getCategories = useCallback(async (): Promise<Category[]> => {
    if (isCacheValid('categories') && !cache.categories.loading) {
      console.log('Using cached categories');
      
      // Background refresh if cache is getting old
      if (shouldBackgroundRefresh('categories')) {
        console.log('Starting background refresh for categories');
        setImmediate(async () => {
          try {
            const categories = await categoryService.getAllCategories();
            updateCache('categories', categories, false);
            console.log('Background refresh completed for categories');
          } catch (error) {
            console.warn('Background refresh failed for categories:', error);
          }
        });
      }
      
      return cache.categories.data;
    }

    if (cache.categories.loading) {
      console.log('Categories fetch already in progress, waiting...');
      return new Promise((resolve) => {
        const checkCache = () => {
          if (!cache.categories.loading) {
            resolve(cache.categories.data);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    try {
      console.log('Fetching fresh categories from API');
      updateCache('categories', cache.categories.data, true);
      const categories = await categoryService.getAllCategories();
      updateCache('categories', categories, false);
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      updateCache('categories', cache.categories.data, false);
      throw error;
    }
  }, [cache.categories, isCacheValid, shouldBackgroundRefresh, updateCache]);

  const refreshCategories = useCallback(async (): Promise<void> => {
    try {
      console.log('Force refreshing categories');
      updateCache('categories', [], true);
      const categories = await categoryService.getAllCategories();
      updateCache('categories', categories, false);
    } catch (error) {
      console.error('Error refreshing categories:', error);
      updateCache('categories', cache.categories.data, false);
      throw error;
    }
  }, [cache.categories.data, updateCache]);

  // Projects methods
  const getProjects = useCallback(async (): Promise<Project[]> => {
    if (isCacheValid('projects') && !cache.projects.loading) {
      console.log('Using cached projects');
      
      // Background refresh if cache is getting old
      if (shouldBackgroundRefresh('projects')) {
        console.log('Starting background refresh for projects');
        setImmediate(async () => {
          try {
            const projects = await projectService.getAllProjects();
            updateCache('projects', projects, false);
            console.log('Background refresh completed for projects');
          } catch (error) {
            console.warn('Background refresh failed for projects:', error);
          }
        });
      }
      
      return cache.projects.data;
    }

    if (cache.projects.loading) {
      console.log('Projects fetch already in progress, waiting...');
      return new Promise((resolve) => {
        const checkCache = () => {
          if (!cache.projects.loading) {
            resolve(cache.projects.data);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    try {
      console.log('Fetching fresh projects from API');
      updateCache('projects', cache.projects.data, true);
      const projects = await projectService.getAllProjects();
      updateCache('projects', projects, false);
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      updateCache('projects', cache.projects.data, false);
      throw error;
    }
  }, [cache.projects, isCacheValid, shouldBackgroundRefresh, updateCache]);

  const refreshProjects = useCallback(async (): Promise<void> => {
    try {
      console.log('Force refreshing projects');
      updateCache('projects', [], true);
      const projects = await projectService.getAllProjects();
      updateCache('projects', projects, false);
    } catch (error) {
      console.error('Error refreshing projects:', error);
      updateCache('projects', cache.projects.data, false);
      throw error;
    }
  }, [cache.projects.data, updateCache]);

  const clearCache = useCallback(() => {
    console.log('Clearing all cache');
    
    // Clear localStorage
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    setCache({
      gallery: { data: [], timestamp: 0, loading: false },
      categories: { data: [], timestamp: 0, loading: false },
      projects: { data: [], timestamp: 0, loading: false },
    });
  }, []);

  const value: DataContextType = {
    // Gallery
    galleryImages: cache.gallery.data,
    galleryLoading: cache.gallery.loading,
    getGalleryImages,
    refreshGalleryImages,
    
    // Categories
    categories: cache.categories.data,
    categoriesLoading: cache.categories.loading,
    getCategories,
    refreshCategories,
    
    // Projects
    projects: cache.projects.data,
    projectsLoading: cache.projects.loading,
    getProjects,
    refreshProjects,
    
    // Cache management
    clearCache,
    isCacheValid,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};