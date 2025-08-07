import React, { useState, useEffect, useMemo } from 'react';
import { GalleryImage } from '../data/galleryData';
import ImageCard from './ImageCard';
import ImageViewer from './ImageViewer';
import { galleryService } from '../services/galleryService';
import { base64ToUrl } from '../utils/imageUtils';

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch gallery images from API
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setLoading(true);
        const images = await galleryService.getAllImages();
        setGalleryImages(images);
        setError(null);
      } catch (err) {
        console.error('Error fetching gallery images:', err);
        setError('Failed to load gallery images. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(galleryImages.map(img => img.category)))],
    [galleryImages]
  );

  const filteredImages = useMemo(() => {
    // Process images to ensure URLs are properly formatted
    const processedImages = galleryImages.map(img => ({
      ...img,
      // Ensure the URL is properly formatted (handles both regular URLs and base64)
      url: img.url || ''
    }));
    
    return selectedCategory === 'All'
      ? processedImages
      : processedImages.filter(img => img.category === selectedCategory);
  }, [selectedCategory, galleryImages]);

  const handleNext = () => {
    if (currentIndex !== null) {
      setCurrentIndex((currentIndex + 1) % filteredImages.length);
    }
  };

  const handlePrev = () => {
    if (currentIndex !== null) {
      setCurrentIndex((currentIndex - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      <h1 className="mt-10 text-3xl font-bold text-center mb-8">Trust Activity Gallery</h1>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* <div className="flex justify-center flex-wrap gap-4 mb-8">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setCurrentIndex(null); // Reset viewer when category changes
            }}
            className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
              selectedCategory === category ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-blue-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div> */}

{/* New ========== New ================= New */}

      <div className="block md:hidden px-4 mb-6">
        <p className="text-lg md:text-xl text-gray-600">
                 Filter by category
              </p>
  <select
    value={selectedCategory}
    onChange={(e) => {
      setSelectedCategory(e.target.value);
      setCurrentIndex(null); // Reset viewer
    }}
    className="w-full p-2 border rounded-md bg-white"
  >
    
    {categories.map((category) => (
      <option key={category} value={category}>
        {category}
      </option>
    ))}
  </select>
</div>

{/* Buttons for desktop and tablet view only */}
<div className="hidden md:flex flex-wrap gap-3 mb-6 justify-center px-4">
  {categories.map((category) => (
    <button
      key={category}
      onClick={() => {
        setSelectedCategory(category);
        setCurrentIndex(null); // Reset viewer
      }}
      className={`px-4 py-2 rounded-full border text-sm transition-colors duration-200 w-auto max-w-full
        ${selectedCategory === category ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-blue-100'}
      `}
    >
      {category}
    </button>
  ))}
</div>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredImages.map((img, index) => (
          <button
            key={img.id}
            onClick={() => setCurrentIndex(index)}
            className="focus:outline-none"
          >
            <ImageCard url={img.url} title={img.title} />
          </button>
        ))}
      </div>

      {currentIndex !== null && (
        <ImageViewer
          imageUrl={filteredImages[currentIndex].url}
          imageTitle={filteredImages[currentIndex].title}
          onClose={() => setCurrentIndex(null)}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
};

export default Gallery;
