import { useEffect, useState, useCallback } from 'react';

interface GalleryImage {
  _id: string;
  title: string;
  category: string;
  description: string;
  url: string;
}

interface UseImagePreloaderOptions {
  images: GalleryImage[];
  batchSize?: number;
  priority?: 'visible' | 'all';
}

export const useImagePreloader = ({ 
  images, 
  batchSize = 10, 
  priority = 'visible' 
}: UseImagePreloaderOptions) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = url;
    });
  }, []);

  const preloadBatch = useCallback(async (urls: string[]) => {
    const batch = urls.slice(0, batchSize);
    setLoadingImages(prev => new Set([...prev, ...batch]));

    try {
      await Promise.allSettled(batch.map(url => preloadImage(url)));
      
      setLoadedImages(prev => new Set([...prev, ...batch]));
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        batch.forEach(url => newSet.delete(url));
        return newSet;
      });

      // Preload next batch
      const remaining = urls.slice(batchSize);
      if (remaining.length > 0) {
        // Use requestIdleCallback for non-blocking preloading
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => preloadBatch(remaining));
        } else {
          setTimeout(() => preloadBatch(remaining), 100);
        }
      }
    } catch (error) {
      console.warn('Some images failed to preload:', error);
      setLoadingImages(prev => {
        const newSet = new Set(prev);
        batch.forEach(url => newSet.delete(url));
        return newSet;
      });
    }
  }, [batchSize, preloadImage]);

  useEffect(() => {
    if (images.length === 0) return;

    const imageUrls = images.map(img => img.url).filter(url => 
      !loadedImages.has(url) && !loadingImages.has(url)
    );

    if (imageUrls.length > 0) {
      preloadBatch(imageUrls);
    }
  }, [images, loadedImages, loadingImages, preloadBatch]);

  return {
    loadedImages,
    loadingImages,
    isImageLoaded: (url: string) => loadedImages.has(url),
    isImageLoading: (url: string) => loadingImages.has(url)
  };
};