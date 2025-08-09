import React from 'react';

interface ImageCardProps {
  url: string;
  title: string;
}

const ImageCard: React.FC<ImageCardProps> = React.memo(({ url, title }) => {
  // The url could be a regular URL or a base64 string
  // No special handling needed as both work with the img src attribute
  return (
    <div className="rounded overflow-hidden shadow-md">
      <img src={url} alt={title} className="w-full h-48 object-cover" />
      {/* <div className="p-2 text-center font-medium">{title}</div> */}
    </div>
  );
});

export default ImageCard;
