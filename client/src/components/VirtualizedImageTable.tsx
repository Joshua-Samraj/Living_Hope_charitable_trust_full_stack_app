import React, { useMemo, useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

interface GalleryImage {
  _id: string;
  title: string;
  category: string;
  description: string;
  url: string;
}

interface VirtualizedImageTableProps {
  images: GalleryImage[];
  isSelectionMode: boolean;
  selectedImages: Set<string>;
  onToggleSelection: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  height?: number;
}

const ImageRowItem = React.memo(({ 
  index, 
  style, 
  data 
}: { 
  index: number; 
  style: React.CSSProperties; 
  data: any; 
}) => {
  const { 
    images, 
    isSelectionMode, 
    selectedImages, 
    onToggleSelection, 
    onEdit, 
    onDelete 
  } = data;
  
  const image = images[index];
  const isSelected = selectedImages.has(image._id);

  return (
    <div style={style} className={`flex items-center border-b border-gray-200 px-4 py-2 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
      {isSelectionMode && (
        <div className="w-12 flex-shrink-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(image._id)}
            className="rounded"
          />
        </div>
      )}
      
      <div className="w-20 flex-shrink-0 mr-4">
        <img
          src={image.url}
          alt={image.title}
          className="w-16 h-16 object-cover rounded"
          loading="lazy"
        />
      </div>
      
      <div className="flex-1 min-w-0 mr-4">
        <div className="font-medium text-gray-900 truncate">{image.title}</div>
        <div className="text-sm text-gray-500 truncate">{image.category}</div>
      </div>
      
      <div className="flex-1 min-w-0 mr-4">
        <div className="text-sm text-gray-700 truncate">{image.description}</div>
      </div>
      
      <div className="w-32 flex-shrink-0">
        {!isSelectionMode ? (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(image._id)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-2 rounded text-xs"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(image._id)}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded text-xs"
            >
              Delete
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-500">
            {isSelected ? 'Selected' : 'Not selected'}
          </span>
        )}
      </div>
    </div>
  );
});

const VirtualizedImageTable: React.FC<VirtualizedImageTableProps> = ({
  images,
  isSelectionMode,
  selectedImages,
  onToggleSelection,
  onEdit,
  onDelete,
  height = 600
}) => {
  const itemData = useMemo(() => ({
    images,
    isSelectionMode,
    selectedImages,
    onToggleSelection,
    onEdit,
    onDelete
  }), [images, isSelectionMode, selectedImages, onToggleSelection, onEdit, onDelete]);

  if (images.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No images found in this category.
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center">
          {isSelectionMode && <div className="w-12 flex-shrink-0 text-sm font-medium">Select</div>}
          <div className="w-20 flex-shrink-0 mr-4 text-sm font-medium">Image</div>
          <div className="flex-1 mr-4 text-sm font-medium">Title & Category</div>
          <div className="flex-1 mr-4 text-sm font-medium">Description</div>
          <div className="w-32 flex-shrink-0 text-sm font-medium">Actions</div>
        </div>
      </div>
      
      {/* Virtualized List */}
      <List
        height={Math.min(height, images.length * 80)}
        itemCount={images.length}
        itemSize={80}
        itemData={itemData}
        overscanCount={5}
      >
        {ImageRowItem}
      </List>
    </div>
  );
};

export default VirtualizedImageTable;