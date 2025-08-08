import { useCallback } from 'react';
import { useData } from '../contexts/DataContext';

/**
 * Hook to manage cache invalidation for different data operations
 */
export const useCacheInvalidation = () => {
  const { refreshGalleryImages, refreshCategories, refreshProjects, clearCache } = useData();

  // Invalidate gallery cache after gallery operations
  const invalidateGallery = useCallback(async () => {
    try {
      await refreshGalleryImages();
    } catch (error) {
      console.error('Failed to invalidate gallery cache:', error);
    }
  }, [refreshGalleryImages]);

  // Invalidate categories cache after category operations
  const invalidateCategories = useCallback(async () => {
    try {
      await refreshCategories();
    } catch (error) {
      console.error('Failed to invalidate categories cache:', error);
    }
  }, [refreshCategories]);

  // Invalidate projects cache after project operations
  const invalidateProjects = useCallback(async () => {
    try {
      await refreshProjects();
    } catch (error) {
      console.error('Failed to invalidate projects cache:', error);
    }
  }, [refreshProjects]);

  // Invalidate all caches
  const invalidateAll = useCallback(async () => {
    try {
      await Promise.all([
        refreshGalleryImages(),
        refreshCategories(),
        refreshProjects()
      ]);
    } catch (error) {
      console.error('Failed to invalidate all caches:', error);
    }
  }, [refreshGalleryImages, refreshCategories, refreshProjects]);

  // Clear all caches (force fresh fetch on next request)
  const clearAllCaches = useCallback(() => {
    clearCache();
  }, [clearCache]);

  return {
    invalidateGallery,
    invalidateCategories,
    invalidateProjects,
    invalidateAll,
    clearAllCaches
  };
};